import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from './Skeleton';
/**
 * OptimizedImage component with lazy loading, progressive loading, and skeleton
 * Designed for Malawi networks - loads images only when in viewport
 */
const OptimizedImage = ({ src, alt, className = '', aspectRatio = 'video', objectFit = 'cover', priority = false, onLoad, onError, }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState(priority ? src : null);
    const imgRef = useRef(null);
    // Intersection Observer for lazy loading
    const { ref: inViewRef, inView } = useInView({
        threshold: 0.01,
        triggerOnce: true,
        skip: priority, // Skip if priority loading
    });
    // Aspect ratio classes
    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[21/9]',
    };
    // Start loading image when in view
    useEffect(() => {
        if (inView && !imageSrc && !priority) {
            setImageSrc(src);
        }
    }, [inView, src, imageSrc, priority]);
    // Handle image load
    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };
    // Handle image error
    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };
    return (_jsxs("div", { ref: inViewRef, className: `relative overflow-hidden bg-gray-200 ${aspectRatioClasses[aspectRatio]} ${className}`, children: [isLoading && !hasError && (_jsx("div", { className: "absolute inset-0", children: _jsx(Skeleton, { className: "w-full h-full" }) })), hasError ? (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { className: "w-12 h-12 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "text-sm", children: "Failed to load image" })] }) })) : imageSrc ? (_jsx(motion.img, { ref: imgRef, src: imageSrc, alt: alt, loading: priority ? 'eager' : 'lazy', decoding: "async", onLoad: handleLoad, onError: handleError, initial: { opacity: 0 }, animate: { opacity: isLoading ? 0 : 1 }, transition: { duration: 0.3 }, className: `w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}` })) : null] }));
};
export default OptimizedImage;
