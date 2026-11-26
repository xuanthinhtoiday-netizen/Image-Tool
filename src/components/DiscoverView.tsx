import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { DISCOVER_CATEGORIES, INSPIRATION_PROMPTS } from '../data/presets';
import { InspirationItem } from '../types/studio';

interface DiscoverViewProps {
  onImagineItem: (item: InspirationItem, autoGenerate: boolean) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onImagineItem,
}) => {
  const [category, setCategory] = useState<string>('Tất cả');

  const items = useMemo(() => {
    if (category === 'Tất cả') return INSPIRATION_PROMPTS;
    return INSPIRATION_PROMPTS.filter((i) => i.category === category);
  }, [category]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/12 px-3 py-1 text-[11px] font-semibold text-blue-500 dark:text-blue-300">
          <Sparkles className="h-3 w-3" />
          <span>Cảm hứng sáng tạo</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Khám phá ý tưởng nổi bật
        </h1>
        <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
          Chọn bất kỳ chủ đề nào để khởi tạo phiên tưởng tượng mới hoặc tùy biến lại theo phong cách riêng của bạn.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {DISCOVER_CATEGORIES.map((cat) => {
          const active = cat === category;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? 'meta-gradient-btn border-transparent text-white shadow-sm'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-blue-500/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Inspiration Masonry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onImagineItem(item, false)}
            className="group relative flex min-h-[210px] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[#111522] p-5 shadow-md transition duration-300 hover:-translate-y-1 hover:border-blue-500/55 hover:shadow-xl"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 transition-opacity group-hover:opacity-100`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/15" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="rounded-full bg-black/35 px-2.5 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-md">
                {item.category} • {item.tag}
              </span>
              <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono-code text-[10.5px] text-white/90">
                {item.aspectRatio}
              </span>
            </div>

            <div className="relative z-10 mt-6">
              <h3 className="font-display text-base font-bold text-white drop-shadow-xs">
                {item.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/85">
                {item.prompt}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
              <span className="font-medium text-white/85 group-hover:text-white">
                Dùng prompt này
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImagineItem(item, true);
                }}
                className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-semibold text-white backdrop-blur-md transition hover:bg-blue-500"
              >
                <span>Tạo ngay</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
