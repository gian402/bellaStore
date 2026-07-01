'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages = images.length > 0 ? images : ['/images/placeholder.jpg'];
  const currentImage = displayImages[selectedIndex];

  const prev = () =>
    setSelectedIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  const next = () =>
    setSelectedIndex((i) => (i + 1) % displayImages.length);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Imagen principal */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage}
                alt={`${productName} - imagen ${selectedIndex + 1}`}
                fill
                className={cn(
                  'object-cover transition-transform duration-500',
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                )}
                onClick={() => setIsZoomed(!isZoomed)}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 p-1.5 rounded-lg shadow-sm">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Navegación */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    i === selectedIndex
                      ? 'w-4 h-1.5 bg-rose-500'
                      : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  'relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200',
                  i === selectedIndex
                    ? 'border-rose-400 shadow-sm'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={img}
                  alt={`Miniatura ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal zoom */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative w-full max-w-2xl aspect-square">
              <Image
                src={currentImage}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
