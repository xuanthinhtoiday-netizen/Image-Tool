import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  Heart,
  Pencil,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import {
  QUICK_EDIT_ACTIONS,
  QUICK_SUGGESTION_CHIPS,
} from '../data/presets';
import {
  ActiveJob,
  GeneratedImage,
  ImagineThread,
} from '../types/studio';
import { MetaHaloLogo } from './MetaHaloLogo';

interface ImagineCanvasProps {
  thread: ImagineThread | null;
  imagesById: Record<string, GeneratedImage>;
  activeJobs: ActiveJob[];
  selectedImageId: string | null;
  onSelectImage: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
  onDownloadImage: (img: GeneratedImage) => void;
  onEditFromImage: (img: GeneratedImage) => void;
  onQuickSuggestion: (chip: (typeof QUICK_SUGGESTION_CHIPS)[number]) => void;
  onQuickFollowUp: (
    basePrompt: string,
    instruction: string,
    label: string,
    overrideStyle?: string
  ) => void;
  onDismissJobError: (jobId: string) => void;
  onSwitchToAiHorde: () => void;
  omniboxNode: React.ReactNode;
}

const ElapsedCounter: React.FC<{ startedAt: number }> = ({ startedAt }) => {
  const [sec, setSec] = useState(() =>
    Math.max(0, (Date.now() - startedAt) / 1000)
  );
  useEffect(() => {
    const id = setInterval(
      () => setSec(Math.max(0, (Date.now() - startedAt) / 1000)),
      250
    );
    return () => clearInterval(id);
  }, [startedAt]);

  return <span className="font-mono-code text-[11px] opacity-75">{sec.toFixed(1)}s</span>;
};

export const ImagineCanvas: React.FC<ImagineCanvasProps> = ({
  thread,
  imagesById,
  activeJobs,
  selectedImageId,
  onSelectImage,
  onToggleFavorite,
  onDownloadImage,
  onEditFromImage,
  onQuickSuggestion,
  onQuickFollowUp,
  onDismissJobError,
  onSwitchToAiHorde,
  omniboxNode,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const turns = thread?.turns ?? [];
  const isEmpty = turns.length === 0;

  useEffect(() => {
    if (!isEmpty) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [turns.length, activeJobs.length, isEmpty]);

  // Empty State — Signature Meta AI centered landing
  if (isEmpty) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:px-6 lg:h-full lg:min-h-0">
        <div className="w-full max-w-3xl space-y-7">
          {/* Halo + Greeting */}
          <div className="flex flex-col items-center text-center">
            <MetaHaloLogo size="lg" glow className="mb-5" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Bạn muốn tưởng tượng điều gì?
            </h1>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              Mô tả ý tưởng hoặc đính kèm ảnh để tạo và biến tấu ngay lập tức — miễn phí với FLUX & AI Horde, hoặc gắn API Key Gemini / OpenAI.
            </p>
          </div>

          {/* Centered Floating Omnibox */}
          <div>{omniboxNode}</div>

          {/* Meta-style Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onQuickSuggestion(chip)}
                className="group flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] shadow-xs transition hover:-translate-y-0.5 hover:border-blue-500/45 hover:text-[var(--text-primary)]"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500 transition-transform group-hover:rotate-12 dark:text-blue-400" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Conversational Imagine Stream
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-full lg:min-h-0">
      {/* Scrollable Feed */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 pt-6 pb-10 sm:px-6 lg:overflow-y-auto">
        {turns.map((turn, turnIndex) => {
          const turnImages = turn.imageIds
            .map((id) => imagesById[id])
            .filter((x): x is GeneratedImage => Boolean(x));
          const turnJobs = activeJobs.filter((j) => j.turnId === turn.id);
          const isLastTurn = turnIndex === turns.length - 1;
          const totalItems = turnImages.length + turnJobs.length;
          const gridClass =
            totalItems <= 1
              ? 'grid-cols-1 max-w-xl'
              : 'grid-cols-1 sm:grid-cols-2';

          return (
            <div key={turn.id} className="space-y-4">
              {/* User Prompt Bubble */}
              <div className="flex justify-end">
                <div
                  className="max-w-[88%] rounded-3xl rounded-tr-md border px-4 py-3 sm:max-w-[78%]"
                  style={{
                    backgroundColor: 'var(--bubble-user)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  {turn.attachedImage && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={turn.attachedImage.dataUrl}
                        alt={turn.attachedImage.name}
                        className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                      />
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Ảnh tham chiếu đính kèm
                      </span>
                    </div>
                  )}
                  {turn.contextNote && (
                    <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10.5px] font-medium text-blue-500 dark:text-blue-300">
                      <Wand2 className="h-3 w-3" />
                      <span>{turn.contextNote}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                    {turn.prompt}
                  </p>
                </div>
              </div>

              {/* AI Response & Media Grid */}
              <div className="flex items-start gap-3">
                <MetaHaloLogo size="sm" className="mt-1" />
                <div className="min-w-0 flex-1 space-y-3">
                  {/* Meta Header Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">
                      Lumina AI
                    </span>
                    <span>•</span>
                    <span>{turn.modelLabel}</span>
                    {turn.styleName !== 'Tự nhiên' && (
                      <>
                        <span>•</span>
                        <span>{turn.styleName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-mono-code text-[11px]">
                      {turn.aspectRatio}
                    </span>
                  </div>

                  {/* Images + Active Loading Cards */}
                  <div className={`grid gap-3 ${gridClass}`}>
                    {turnJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`relative overflow-hidden rounded-2xl border p-4 ${
                          job.error
                            ? 'border-rose-500/40 bg-rose-500/[0.08]'
                            : 'animate-meta-shimmer border-blue-500/35 bg-[var(--bg-surface)]'
                        }`}
                        style={
                          job.error
                            ? { minHeight: 210 }
                            : {
                                aspectRatio: `${job.width} / ${job.height}`,
                                minHeight: 220,
                                maxHeight: 440,
                              }
                        }
                      >
                        <div className="relative z-10 flex h-full flex-col justify-between gap-3">
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                            <span className="font-medium">{job.modelLabel}</span>
                            {!job.error && (
                              <ElapsedCounter startedAt={job.startedAt} />
                            )}
                          </div>

                          {job.error ? (
                            <div className="my-auto space-y-2.5 py-2 text-center">
                              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                                <AlertTriangle className="h-4.5 w-4.5" />
                              </div>
                              <p className="text-xs leading-relaxed text-rose-500 dark:text-rose-200">
                                {job.error}
                              </p>
                              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                {job.providerName.includes('Pollinations') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDismissJobError(job.id);
                                      onSwitchToAiHorde();
                                    }}
                                    className="rounded-full bg-blue-500 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-600"
                                  >
                                    Chuyển sang AI Horde Free
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onDismissJobError(job.id)}
                                  className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                                >
                                  Đóng
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="my-auto flex flex-col items-center gap-2.5 text-center">
                              <MetaHaloLogo size="md" glow />
                              <p className="text-xs font-medium text-[var(--text-primary)]">
                                {job.statusText}
                              </p>
                              {typeof job.progress === 'number' && (
                                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-blue-500/15">
                                  <div
                                    className="meta-gradient-btn h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.max(12, job.progress)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10.5px] text-[var(--text-muted)]">
                            <span>{job.providerName}</span>
                            <span className="font-mono-code">
                              {job.width}×{job.height}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {turnImages.map((img) => {
                      const isSelected = selectedImageId === img.id;
                      return (
                        <div
                          key={img.id}
                          onClick={() => onSelectImage(img)}
                          className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-[var(--bg-surface)] transition duration-300 ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500/40'
                              : 'border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-xl'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="block w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          />

                          {/* Floating Quick Actions */}
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono-code text-[10.5px] text-white/90 backdrop-blur-md">
                              {(img.durationMs / 1000).toFixed(1)}s
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditFromImage(img);
                                }}
                                title="Chỉnh sửa tiếp từ ảnh này"
                                className="flex h-8 items-center gap-1 rounded-full bg-white/15 px-2.5 text-[11px] font-medium text-white backdrop-blur-md transition hover:bg-blue-500/80"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(img.id);
                                }}
                                title="Yêu thích"
                                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
                                  img.favorite
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-white/15 text-white hover:bg-white/30'
                                }`}
                              >
                                <Heart
                                  className={`h-3.5 w-3.5 ${
                                    img.favorite ? 'fill-current' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDownloadImage(img);
                                }}
                                title="Tải xuống"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-blue-500"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Meta AI Style One-Click Follow-Up Chips (shown on latest finished turn) */}
                  {isLastTurn && turnImages.length > 0 && turnJobs.length === 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {QUICK_EDIT_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() =>
                            onQuickFollowUp(
                              turn.prompt,
                              action.instruction,
                              action.label,
                              action.overrideStyle
                            )
                          }
                          className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--text-secondary)] transition hover:border-blue-500/45 hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-300"
                        >
                          {action.id === 'variation' ? (
                            <RefreshCw className="h-3 w-3" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Anchored Floating Omnibox (Meta AI signature) */}
      <div
        className="sticky bottom-0 z-20 shrink-0 px-4 pt-3 pb-4 sm:px-6"
        style={{
          background:
            'linear-gradient(to top, var(--bg-canvas) 75%, transparent 100%)',
        }}
      >
        <div className="mx-auto max-w-3xl">{omniboxNode}</div>
      </div>
    </div>
  );
};
