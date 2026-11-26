import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { GeneratedImage } from '../types/studio';

interface LightboxModalProps {
  image: GeneratedImage | null;
  images: GeneratedImage[];
  onClose: () => void;
  onSelectImage: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (img: GeneratedImage) => void;
  onRemix: (img: GeneratedImage) => void;
  onDelete: (id: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  image,
  images,
  onClose,
  onSelectImage,
  onToggleFavorite,
  onDownload,
  onRemix,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  const currentIndex = image
    ? images.findIndex((item) => item.id === image.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < images.length - 1;

  useEffect(() => {
    if (!image) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) {
        onSelectImage(images[currentIndex - 1]);
      }
      if (e.key === 'ArrowRight' && hasNext) {
        onSelectImage(images[currentIndex + 1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [image, currentIndex, hasPrev, hasNext, images, onClose, onSelectImage]);

  if (!image) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-200 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left: Artwork Preview */}
        <div className="relative flex flex-1 items-center justify-center bg-[#06070b] p-4 sm:p-6">
          {hasPrev && (
            <button
              type="button"
              onClick={() => onSelectImage(images[currentIndex - 1])}
              className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <img
            src={image.url}
            alt={image.prompt}
            className="max-h-[55vh] max-w-full rounded-2xl object-contain shadow-2xl lg:max-h-[84vh]"
          />

          {hasNext && (
            <button
              type="button"
              onClick={() => onSelectImage(images[currentIndex + 1])}
              className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Right: Metadata & Controls */}
        <div className="flex w-full shrink-0 flex-col justify-between border-t border-white/[0.08] bg-[#0c0e17] p-5 lg:w-[360px] lg:border-t-0 lg:border-l">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div>
              <span className="text-[10.5px] font-semibold tracking-wider text-violet-300 uppercase">
                Chi tiết tác phẩm
              </span>
              <h3 className="mt-1 font-display text-base font-semibold text-white">
                {image.modelLabel}
              </h3>
              <p className="text-xs text-zinc-400">{image.providerName}</p>
            </div>

            {/* Prompt Box */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">
                  Prompt gốc
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Sao chép
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs leading-relaxed text-zinc-200">
                {image.prompt}
              </p>
            </div>

            {image.negativePrompt && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="mb-1 text-[10.5px] font-semibold text-zinc-400">
                  Negative Prompt
                </div>
                <p className="text-[11.5px] text-zinc-300">
                  {image.negativePrompt}
                </p>
              </div>
            )}

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="text-[10px] text-zinc-500 uppercase">
                  Kích thước
                </div>
                <div className="mt-0.5 font-mono-code font-medium text-zinc-200">
                  {image.width} × {image.height}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="text-[10px] text-zinc-500 uppercase">
                  Tỉ lệ
                </div>
                <div className="mt-0.5 font-mono-code font-medium text-zinc-200">
                  {image.aspectRatio}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="text-[10px] text-zinc-500 uppercase">
                  Phong cách
                </div>
                <div className="mt-0.5 truncate font-medium text-zinc-200">
                  {image.styleName}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="text-[10px] text-zinc-500 uppercase">Seed</div>
                <div className="mt-0.5 truncate font-mono-code font-medium text-zinc-200">
                  {image.seed}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={() => onDownload(image)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110"
            >
              <Download className="h-4 w-4" />
              <span>Tải ảnh chất lượng gốc</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onRemix(image);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-zinc-200 transition hover:border-violet-400/40 hover:bg-violet-500/15"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Remix</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(image.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
                  image.favorite
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                    : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10'
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${image.favorite ? 'fill-current' : ''}`}
                />
                <span>Thích</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(image.id);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-zinc-300 transition hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
