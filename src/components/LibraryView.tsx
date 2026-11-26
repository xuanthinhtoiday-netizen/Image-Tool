import React, { useMemo, useState } from 'react';
import {
  Download,
  Heart,
  Pencil,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { GeneratedImage } from '../types/studio';

interface LibraryViewProps {
  mode: 'library' | 'favorites';
  images: GeneratedImage[];
  selectedImageId: string | null;
  onSelectImage: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (img: GeneratedImage) => void;
  onEditFromImage: (img: GeneratedImage) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onStartImagine: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  mode,
  images,
  selectedImageId,
  onSelectImage,
  onToggleFavorite,
  onDownload,
  onEditFromImage,
  onDelete,
  onClearAll,
  onStartImagine,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const base = mode === 'favorites' ? images.filter((i) => i.favorite) : images;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (i) =>
        i.prompt.toLowerCase().includes(q) ||
        i.modelLabel.toLowerCase().includes(q) ||
        i.styleName.toLowerCase().includes(q)
    );
  }, [images, mode, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {mode === 'favorites' ? 'Ảnh yêu thích' : 'Thư viện của bạn'}
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
            {filtered.length} tác phẩm được lưu bền vững ngay trên trình duyệt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo prompt, phong cách..."
              className="w-52 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 pr-3.5 pl-8.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-blue-500 sm:w-64"
            />
          </div>

          {mode === 'library' && images.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]/50 px-6 py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-400">
            {mode === 'favorites' ? (
              <Heart className="h-6 w-6" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </div>
          <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
            {mode === 'favorites'
              ? 'Chưa có ảnh yêu thích nào'
              : 'Thư viện đang trống'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">
            {mode === 'favorites'
              ? 'Bấm biểu tượng trái tim trên bất kỳ bức ảnh nào để lưu vào mục Yêu thích.'
              : 'Hãy bắt đầu tưởng tượng bức ảnh đầu tiên của bạn ngay bây giờ.'}
          </p>
          {mode === 'library' && (
            <button
              type="button"
              onClick={onStartImagine}
              className="meta-gradient-btn mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white"
            >
              Tạo ảnh ngay
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
          {filtered.map((img) => {
            const active = selectedImageId === img.id;
            return (
              <article
                key={img.id}
                onClick={() => onSelectImage(img)}
                className={`group relative break-inside-avoid cursor-pointer overflow-hidden rounded-2xl border bg-[var(--bg-surface)] transition duration-300 ${
                  active
                    ? 'border-blue-500 ring-2 ring-blue-500/40'
                    : 'border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-xl'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  loading="lazy"
                  className="block w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur-md">
                    {img.modelLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(img.id);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md ${
                        img.favorite
                          ? 'bg-rose-500 text-white'
                          : 'bg-black/55 text-white hover:bg-black/80'
                      }`}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${img.favorite ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(img.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="mb-2 line-clamp-2 text-xs text-white">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-[10px] text-white/75">
                      {img.aspectRatio} • {img.styleName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFromImage(img);
                        }}
                        className="flex h-7 items-center gap-1 rounded-full bg-white/15 px-2.5 text-[10.5px] font-medium text-white backdrop-blur-md hover:bg-blue-500"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(img);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-blue-500"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
