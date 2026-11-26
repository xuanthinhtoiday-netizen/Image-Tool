import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Eraser,
  Expand,
  Heart,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { GeneratedImage } from '../types/studio';
import { LogoRemovalMode } from '../utils/logoRemover';

interface InspectorPanelProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onOpenFullscreen: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
  onEditFromImage: (img: GeneratedImage) => void;
  onCleanLogo: (img: GeneratedImage, mode: LogoRemovalMode) => Promise<void>;
  onRemix: (img: GeneratedImage) => void;
  onDelete: (id: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  image,
  onClose,
  onOpenFullscreen,
  onDownload,
  onToggleFavorite,
  onEditFromImage,
  onCleanLogo,
  onRemix,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  if (!image) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleTriggerClean = async (mode: LogoRemovalMode) => {
    if (cleaning) return;
    setCleaning(true);
    try {
      await onCleanLogo(image, mode);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[360px] flex-col border-l shadow-2xl xl:sticky xl:top-0 xl:h-screen xl:w-[350px] xl:shrink-0 xl:shadow-none"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Top Bar */}
      <div
        className="flex h-14 items-center justify-between border-b px-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
          Chi tiết tác phẩm
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenFullscreen(image)}
            title="Phóng to toàn màn hình"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Đóng bảng chi tiết"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Image Preview */}
        <div
          onClick={() => onOpenFullscreen(image)}
          className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-black/20"
        >
          <img
            src={image.url}
            alt={image.prompt}
            className="max-h-[300px] w-full object-contain"
          />
          <div className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
            Bấm để phóng to
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onDownload(image)}
            className="meta-gradient-btn flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            <span>Tải ảnh chất lượng gốc</span>
          </button>

          <button
            type="button"
            onClick={() => onEditFromImage(image)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/12 py-2 text-xs font-semibold text-blue-500 transition hover:bg-blue-500/20 dark:text-blue-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Chỉnh sửa tiếp từ ảnh này</span>
          </button>

          {/* Manual Logo Cleanup Controls */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={cleaning}
              onClick={() => handleTriggerClean('inpaint')}
              className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 py-1.5 text-[11.5px] font-semibold text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-300"
            >
              {cleaning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eraser className="h-3.5 w-3.5" />
              )}
              <span>Xóa logo (Inpaint)</span>
            </button>
            <button
              type="button"
              disabled={cleaning}
              onClick={() => handleTriggerClean('crop')}
              className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] py-1.5 text-[11.5px] font-medium text-emerald-600 transition hover:bg-emerald-500/18 disabled:opacity-50 dark:text-emerald-300"
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>Cắt sạch mép</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => onRemix(image)}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Remix</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(image.id)}
              className={`flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-medium transition ${
                image.favorite
                  ? 'border-rose-500/40 bg-rose-500/15 text-rose-500 dark:text-rose-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${image.favorite ? 'fill-current' : ''}`}
              />
              <span>Thích</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(image.id)}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa</span>
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              Prompt
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:underline dark:text-blue-400"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" /> Đã chép
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Sao chép
                </>
              )}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">
            {image.prompt}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">
              Mô hình
            </div>
            <div className="mt-0.5 truncate font-semibold text-[var(--text-primary)]">
              {image.modelLabel}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">
              Nguồn AI
            </div>
            <div className="mt-0.5 truncate font-medium text-[var(--text-primary)]">
              {image.providerName}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">
              Kích thước
            </div>
            <div className="mt-0.5 font-mono-code font-medium text-[var(--text-primary)]">
              {image.width} × {image.height}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">
              Phong cách
            </div>
            <div className="mt-0.5 truncate font-medium text-[var(--text-primary)]">
              {image.styleName}
            </div>
          </div>

          <div className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">
              Seed & Thời gian render
            </div>
            <div className="mt-0.5 flex items-center justify-between font-mono-code text-[11.5px] text-[var(--text-primary)]">
              <span>{image.seed}</span>
              <span className="text-[var(--text-muted)]">
                {(image.durationMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
