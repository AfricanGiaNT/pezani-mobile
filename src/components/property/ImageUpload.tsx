import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  compressed?: File;
  isCompressing?: boolean;
  isUploading?: boolean;
  isUploaded?: boolean;
  uploadedUrl?: string;
  error?: string;
}

interface ImageUploadProps {
  onImagesChange?: (images: ImageFile[]) => void;
  onUploadedImagesChange?: (images: Array<{ url: string; isPrimary: boolean; displayOrder: number }>) => void;
  maxImages?: number;
}

const ImageUpload = ({ onImagesChange, onUploadedImagesChange, maxImages = 10 }: ImageUploadProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of uploaded images when images or primaryImageId changes
  useEffect(() => {
    if (onUploadedImagesChange) {
      const uploadedImagesData = images
        .filter(img => img.isUploaded && img.uploadedUrl)
        .map((img, index) => ({
          url: img.uploadedUrl!,
          isPrimary: img.id === primaryImageId,
          displayOrder: index,
        }));
      onUploadedImagesChange(uploadedImagesData);
    }
  }, [images, primaryImageId, onUploadedImagesChange]);

  const compressionOptions = {
    maxSizeMB: 0.3, // 300KB
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };

  const uploadImageToSupabase = async (file: File, imageId: string): Promise<string> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Starting upload for:', fileName, 'Size:', (file.size / 1024).toFixed(2), 'KB');

      // Upload to Supabase Storage with timeout wrapper
      const uploadWithTimeout = async () => {
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        return { data, error };
      };

      // Add timeout (30 seconds)
      const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout: Request took too long (30s)')), 30000);
      });

      const { data, error } = await Promise.race([uploadWithTimeout(), timeoutPromise]);

      if (error) {
        console.error('Upload error details:', error);
        // Provide helpful error message
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          throw new Error('Storage bucket "property-images" not found. Please create it in Supabase Dashboard > Storage. See docs/SUPABASE_STORAGE_SETUP.md for instructions.');
        }
        if (error.message?.includes('row-level security') || error.message?.includes('RLS') || error.message?.includes('policy')) {
          throw new Error('Storage policies not configured. Please run the SQL policies in docs/SUPABASE_STORAGE_SETUP.md in your Supabase SQL Editor.');
        }
        if (error.message?.includes('timeout')) {
          throw new Error('Upload timed out. Please check your internet connection and try again.');
        }
        if (error.message?.includes('JWT') || error.message?.includes('token')) {
          throw new Error('Authentication error. Please log in again.');
        }
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum is ${maxImages}.`);
      return;
    }

    const newImages: ImageFile[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
        continue;
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} has invalid format. Only JPG, PNG, and WEBP are allowed.`);
        continue;
      }

      const imageFile: ImageFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        isCompressing: true,
      };

      newImages.push(imageFile);
    }

    setImages((prev) => {
      const updated = [...prev, ...newImages];
      
      // Set first image as primary if none selected
      if (!primaryImageId && updated.length > 0) {
        setPrimaryImageId(updated[0].id);
      }
      
      return updated;
    });

    // Compress and upload images asynchronously
    for (const imageFile of newImages) {
      try {
        // Compress first
        const compressed = await compressImage(imageFile.file);
        
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, compressed, isCompressing: false, isUploading: true }
              : img
          )
        );

        // Upload to Supabase
        const uploadedUrl = await uploadImageToSupabase(compressed, imageFile.id);
        
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, isUploading: false, isUploaded: true, uploadedUrl }
              : img
          )
        );
      } catch (error: any) {
        const errorMessage = error.message || 'Upload failed';
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, isCompressing: false, isUploading: false, error: errorMessage }
              : img
          )
        );
        // Show user-friendly error alert for bucket/policy issues
        if (errorMessage.includes('Bucket not found') || errorMessage.includes('not found')) {
          alert('⚠️ Storage bucket "property-images" not found!\n\nPlease create it in Supabase Dashboard:\n1. Go to Storage\n2. Click "New bucket"\n3. Name: property-images\n4. Enable "Public bucket"\n\nSee docs/SUPABASE_STORAGE_SETUP.md for detailed instructions.');
        } else if (errorMessage.includes('row-level security') || errorMessage.includes('RLS') || errorMessage.includes('policy')) {
          alert('⚠️ Storage policies not configured!\n\nPlease run the SQL policies in docs/SUPABASE_STORAGE_SETUP.md in your Supabase SQL Editor.\n\nThis is required for uploads to work.');
        }
      }
    }

    // Notify parent with updated images (only onImagesChange, onUploadedImagesChange handled by useEffect)
    setImages((current) => {
      onImagesChange?.(current);
      return current;
    });
  }, [images, maxImages, primaryImageId, onImagesChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = ''; // Reset input
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      
      // If removed image was primary, set new primary
      if (primaryImageId === id && updated.length > 0) {
        setPrimaryImageId(updated[0].id);
      } else if (updated.length === 0) {
        setPrimaryImageId(null);
      }
      
      return updated;
    });
  }, [primaryImageId]);

  const setPrimary = useCallback((id: string) => {
    setPrimaryImageId(id);
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            animate={{ y: isDragging ? -10 : 0 }}
            className="mb-4 flex justify-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload size={32} className="text-primary" />
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-text mb-2">
            {isDragging ? 'Drop images here' : 'Upload Property Images'}
          </h3>

          <p className="text-text-light mb-4">
            Drag & drop images here, or click to select files
          </p>

          <Button type="button" onClick={openFileDialog} variant="outline">
            <ImageIcon size={18} className="mr-2" />
            Select Images
          </Button>

          <div className="mt-4 text-sm text-text-light">
            <p>• Maximum {maxImages} images</p>
            <p>• JPG, PNG, or WEBP format</p>
            <p>• Images will be compressed to ~300KB for faster loading</p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-text">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            <p className="text-sm text-text-light">
              Click the radio button to set primary image
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                    primaryImageId === image.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => removeImage(image.id)}
                    >
                      <X size={16} className="mr-1" />
                      Remove
                    </Button>
                  </div>

                  {/* Primary Radio Button */}
                  <div className="absolute top-2 left-2">
                    <button
                      type="button"
                      onClick={() => setPrimary(image.id)}
                      className={`w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                        primaryImageId === image.id
                          ? 'border-primary'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {primaryImageId === image.id && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {image.isCompressing && (
                      <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Compressing...
                      </div>
                    )}
                    {image.isUploading && (
                      <div className="px-2 py-1 bg-yellow-500 text-white text-xs rounded flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </div>
                    )}
                    {!image.isCompressing && !image.isUploading && image.isUploaded && (
                      <div className="px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Uploaded
                      </div>
                    )}
                    {image.error && (
                      <div className="px-2 py-1 bg-red-500 text-white text-xs rounded flex items-center gap-1">
                        <AlertCircle size={12} />
                        Error
                      </div>
                    )}
                  </div>

                  {/* Primary Label */}
                  {primaryImageId === image.id && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-1 text-center font-semibold">
                      Primary Image
                    </div>
                  )}

                  {/* File Size Info */}
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.compressed && (
                      <div className="bg-black/70 px-2 py-1 rounded">
                        Original: {(image.file.size / 1024).toFixed(0)}KB →{' '}
                        {(image.compressed.size / 1024).toFixed(0)}KB
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-text-light">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

