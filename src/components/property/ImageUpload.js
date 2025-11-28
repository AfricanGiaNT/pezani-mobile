import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
const ImageUpload = ({ onImagesChange, onUploadedImagesChange, maxImages = 10 }) => {
    const [images, setImages] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    // Notify parent of uploaded images when images or primaryImageId changes
    useEffect(() => {
        if (onUploadedImagesChange) {
            const uploadedImagesData = images
                .filter(img => img.isUploaded && img.uploadedUrl)
                .map((img, index) => ({
                url: img.uploadedUrl,
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
        fileType: 'image/webp',
    };
    const compressImage = async (file) => {
        try {
            const compressedFile = await imageCompression(file, compressionOptions);
            return compressedFile;
        }
        catch (error) {
            console.error('Compression error:', error);
            throw error;
        }
    };
    const uploadImageToSupabase = async (file, imageId) => {
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
            const timeoutPromise = new Promise((_, reject) => {
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
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };
    const handleFiles = useCallback(async (files) => {
        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;
        if (fileArray.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more image(s). Maximum is ${maxImages}.`);
            return;
        }
        const newImages = [];
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
            const imageFile = {
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
                setImages((prev) => prev.map((img) => img.id === imageFile.id
                    ? { ...img, compressed, isCompressing: false, isUploading: true }
                    : img));
                // Upload to Supabase
                const uploadedUrl = await uploadImageToSupabase(compressed, imageFile.id);
                setImages((prev) => prev.map((img) => img.id === imageFile.id
                    ? { ...img, isUploading: false, isUploaded: true, uploadedUrl }
                    : img));
            }
            catch (error) {
                const errorMessage = error.message || 'Upload failed';
                setImages((prev) => prev.map((img) => img.id === imageFile.id
                    ? { ...img, isCompressing: false, isUploading: false, error: errorMessage }
                    : img));
                // Show user-friendly error alert for bucket/policy issues
                if (errorMessage.includes('Bucket not found') || errorMessage.includes('not found')) {
                    alert('⚠️ Storage bucket "property-images" not found!\n\nPlease create it in Supabase Dashboard:\n1. Go to Storage\n2. Click "New bucket"\n3. Name: property-images\n4. Enable "Public bucket"\n\nSee docs/SUPABASE_STORAGE_SETUP.md for detailed instructions.');
                }
                else if (errorMessage.includes('row-level security') || errorMessage.includes('RLS') || errorMessage.includes('policy')) {
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
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleFileSelect = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = ''; // Reset input
        }
    }, [handleFiles]);
    const removeImage = useCallback((id) => {
        setImages((prev) => {
            const updated = prev.filter((img) => img.id !== id);
            // If removed image was primary, set new primary
            if (primaryImageId === id && updated.length > 0) {
                setPrimaryImageId(updated[0].id);
            }
            else if (updated.length === 0) {
                setPrimaryImageId(null);
            }
            return updated;
        });
    }, [primaryImageId]);
    const setPrimary = useCallback((id) => {
        setPrimaryImageId(id);
    }, []);
    const openFileDialog = () => {
        fileInputRef.current?.click();
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave, className: `relative border-2 border-dashed rounded-lg p-8 transition-all ${isDragging
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/jpg,image/png,image/webp", multiple: true, onChange: handleFileSelect, className: "hidden" }), _jsxs("div", { className: "text-center", children: [_jsx(motion.div, { animate: { y: isDragging ? -10 : 0 }, className: "mb-4 flex justify-center", children: _jsx("div", { className: "w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Upload, { size: 32, className: "text-primary" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-text mb-2", children: isDragging ? 'Drop images here' : 'Upload Property Images' }), _jsx("p", { className: "text-text-light mb-4", children: "Drag & drop images here, or click to select files" }), _jsxs(Button, { type: "button", onClick: openFileDialog, variant: "outline", children: [_jsx(ImageIcon, { size: 18, className: "mr-2" }), "Select Images"] }), _jsxs("div", { className: "mt-4 text-sm text-text-light", children: [_jsxs("p", { children: ["\u2022 Maximum ", maxImages, " images"] }), _jsx("p", { children: "\u2022 JPG, PNG, or WEBP format" }), _jsx("p", { children: "\u2022 Images will be compressed to ~300KB for faster loading" })] })] })] }), images.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "font-semibold text-text", children: ["Uploaded Images (", images.length, "/", maxImages, ")"] }), _jsx("p", { className: "text-sm text-text-light", children: "Click the radio button to set primary image" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: _jsx(AnimatePresence, { children: images.map((image) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, className: `relative group rounded-lg overflow-hidden border-2 transition-all ${primaryImageId === image.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-gray-200'}`, children: [_jsx("div", { className: "aspect-square bg-gray-100", children: _jsx("img", { src: image.preview, alt: "Preview", className: "w-full h-full object-cover" }) }), _jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: _jsxs(Button, { type: "button", size: "sm", variant: "danger", onClick: () => removeImage(image.id), children: [_jsx(X, { size: 16, className: "mr-1" }), "Remove"] }) }), _jsx("div", { className: "absolute top-2 left-2", children: _jsx("button", { type: "button", onClick: () => setPrimary(image.id), className: `w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all ${primaryImageId === image.id
                                                ? 'border-primary'
                                                : 'border-gray-300 hover:border-primary'}`, children: primaryImageId === image.id && (_jsx("div", { className: "w-3 h-3 rounded-full bg-primary" })) }) }), _jsxs("div", { className: "absolute top-2 right-2", children: [image.isCompressing && (_jsxs("div", { className: "px-2 py-1 bg-blue-500 text-white text-xs rounded flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Compressing..."] })), image.isUploading && (_jsxs("div", { className: "px-2 py-1 bg-yellow-500 text-white text-xs rounded flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Uploading..."] })), !image.isCompressing && !image.isUploading && image.isUploaded && (_jsxs("div", { className: "px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), "Uploaded"] })), image.error && (_jsxs("div", { className: "px-2 py-1 bg-red-500 text-white text-xs rounded flex items-center gap-1", children: [_jsx(AlertCircle, { size: 12 }), "Error"] }))] }), primaryImageId === image.id && (_jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-1 text-center font-semibold", children: "Primary Image" })), _jsx("div", { className: "absolute bottom-2 left-2 right-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity", children: image.compressed && (_jsxs("div", { className: "bg-black/70 px-2 py-1 rounded", children: ["Original: ", (image.file.size / 1024).toFixed(0), "KB \u2192", ' ', (image.compressed.size / 1024).toFixed(0), "KB"] })) })] }, image.id))) }) })] })), images.length === 0 && (_jsxs("div", { className: "text-center py-8 text-text-light", children: [_jsx(ImageIcon, { size: 48, className: "mx-auto mb-2 opacity-30" }), _jsx("p", { children: "No images uploaded yet" })] }))] }));
};
export default ImageUpload;
