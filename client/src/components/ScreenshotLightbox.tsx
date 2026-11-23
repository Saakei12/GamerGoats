import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScreenshotLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer z-10"
        aria-label="Close viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation chevrons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-6 p-3 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="absolute right-6 p-3 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="max-w-6xl max-h-[85vh] p-4 flex flex-col items-center">
        <img
          src={images[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-zinc-800"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />
        <span className="text-xs text-zinc-500 mt-3 font-mono">
          {currentIndex + 1} of {images.length}
        </span>
      </div>
    </div>
  );
};

