import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const ImageCarousel = ({ images, propertyTitle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!images || images.length === 0) {
        return (_jsx("div", { className: "relative w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-text-light", children: "No images available" }) }));
    }
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    const goToImage = (index) => {
        setCurrentIndex(index);
    };
    return (_jsxs("div", { className: "relative w-full", children: [_jsxs("div", { className: "relative w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden", children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.img, { src: images[currentIndex], alt: propertyTitle || `Property image ${currentIndex + 1}`, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, className: "w-full h-full object-cover" }, currentIndex) }), images.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: goToPrevious, className: "absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10", "aria-label": "Previous image", children: _jsx(ChevronLeft, { size: 24 }) }), _jsx("button", { onClick: goToNext, className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10", "aria-label": "Next image", children: _jsx(ChevronRight, { size: 24 }) })] })), images.length > 1 && (_jsxs("div", { className: "absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full z-10", children: [currentIndex + 1, " / ", images.length] }))] }), images.length > 1 && (_jsx("div", { className: "mt-4 flex gap-2 overflow-x-auto pb-2", children: images.map((image, index) => (_jsx("button", { onClick: () => goToImage(index), className: `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'}`, children: _jsx("img", { src: image, alt: `Thumbnail ${index + 1}`, className: "w-full h-full object-cover" }) }, index))) }))] }));
};
export default ImageCarousel;
