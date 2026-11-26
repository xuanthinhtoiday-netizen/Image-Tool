import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Check,
  Cpu,
  Dices,
  Eraser,
  ImagePlus,
  Layers,
  Lock,
  Palette,
  Ratio,
  SlidersHorizontal,
  Sparkles,
  Square,
  Unlock,
  X,
} from 'lucide-react';
import { ASPECT_RATIOS, PROVIDERS, STYLE_PRESETS } from '../data/presets';
import {
  ApiKeys,
  AspectRatioOption,
  AttachedImage,
  ProviderConfig,
  ProviderId,
  StylePreset,
} from '../types/studio';
import { LogoRemovalMode } from '../utils/logoRemover';

type OpenPopover = 'provider' | 'ratio' | 'style' | 'advanced' | null;

interface OmniboxProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onMagicEnhance: () => void;
  isGenerating: boolean;
  providerId: ProviderId;
  onProviderChange: (id: ProviderId) => void;
  modelId: string;
  onModelChange: (id: string) => void;
  aspectRatioId: string;
  onAspectRatioChange: (id: string) => void;
  styleId: string;
  onStyleChange: (id: string) => void;
  batchCount: number;
  onBatchCountChange: (count: number) => void;
  promptMagic: boolean;
  onPromptMagicChange: (val: boolean) => void;
  autoRemoveLogo: boolean;
  onAutoRemoveLogoChange: (val: boolean) => void;
  logoRemovalMode: LogoRemovalMode;
  onLogoRemovalModeChange: (mode: LogoRemovalMode) => void;
  negativePrompt: string;
  onNegativePromptChange: (val: string) => void;
  seed: string;
  onSeedChange: (val: string) => void;
  lockSeed: boolean;
  onLockSeedChange: (val: boolean) => void;
  attachedImage: AttachedImage | null;
  onAttachImage: (img: AttachedImage | null) => void;
  apiKeys: ApiKeys;
  onOpenApiKeys: () => void;
  popoverDirection?: 'up' | 'down';
  isFollowUpMode?: boolean;
  placeholder?: string;
}

export const Omnibox: React.FC<OmniboxProps> = ({
  prompt,
  onPromptChange,
  onSubmit,
  onCancel,
  onMagicEnhance,
  isGenerating,
  providerId,
  onProviderChange,
  modelId,
  onModelChange,
  aspectRatioId,
  onAspectRatioChange,
  styleId,
  onStyleChange,
  batchCount,
  onBatchCountChange,
  promptMagic,
  onPromptMagicChange,
  autoRemoveLogo,
  onAutoRemoveLogoChange,
  logoRemovalMode,
  onLogoRemovalModeChange,
  negativePrompt,
  onNegativePromptChange,
  seed,
  onSeedChange,
  lockSeed,
  onLockSeedChange,
  attachedImage,
  onAttachImage,
  apiKeys,
  onOpenApiKeys,
  popoverDirection = 'up',
  isFollowUpMode = false,
  placeholder,
}) => {
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentProvider: ProviderConfig =
    PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
  const currentModel =
    currentProvider.models.find((m) => m.id === modelId) ||
    currentProvider.models[0];
  const currentRatio: AspectRatioOption =
    ASPECT_RATIOS.find((r) => r.id === aspectRatioId) || ASPECT_RATIOS[0];
  const currentStyle: StylePreset =
    STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Auto-resize textarea cleanly
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(160, Math.max(46, el.scrollHeight))}px`;
  }, [prompt]);

  const hasKey = (id: ProviderId) => {
    if (id === 'pollinations-free' || id === 'aihorde-free') return true;
    if (id === 'pollinations-pro') return Boolean(apiKeys.pollinationsKey.trim());
    if (id === 'gemini') return Boolean(apiKeys.geminiKey.trim());
    if (id === 'openai') return Boolean(apiKeys.openaiKey.trim());
    if (id === 'huggingface') return Boolean(apiKeys.huggingfaceKey.trim());
    return false;
  };

  const handleFilePicked = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onAttachImage({
          dataUrl: reader.result,
          mimeType: file.type,
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFilePicked(file);
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        setOpenPopover(null);
        onSubmit();
      }
    }
  };

  const popoverPositionClass =
    popoverDirection === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2.5';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Popover Menus */}
      {openPopover === 'provider' && (
        <div
          className={`absolute left-0 z-40 w-full max-w-md overflow-hidden rounded-2xl border p-3 shadow-2xl backdrop-blur-xl ${popoverPositionClass}`}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Chọn nguồn AI & Mô hình
            </span>
            <button
              type="button"
              onClick={() => {
                setOpenPopover(null);
                onOpenApiKeys();
              }}
              className="text-[11px] font-medium text-blue-500 hover:underline dark:text-blue-400"
            >
              Quản lý API Keys
            </button>
          </div>

          <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
            {PROVIDERS.map((p) => {
              const isSelectedProvider = p.id === providerId;
              const configured = hasKey(p.id);
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-2 transition ${
                    isSelectedProvider
                      ? 'border-blue-500/45 bg-blue-500/[0.08]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onProviderChange(p.id)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          p.isFree
                            ? 'bg-emerald-400'
                            : configured
                              ? 'bg-blue-400'
                              : 'bg-zinc-500'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {p.name}
                      </span>
                    </div>
                    {p.isFree ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-300">
                        Free
                      </span>
                    ) : configured ? (
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-500 dark:text-blue-300">
                        Sẵn sàng
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-500 dark:text-amber-300">
                        Cần Key
                      </span>
                    )}
                  </button>

                  {isSelectedProvider && (
                    <div className="mt-2 grid grid-cols-1 gap-1 border-t border-[var(--border-subtle)] pt-2">
                      {p.models.map((m) => {
                        const activeModel = m.id === modelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              onModelChange(m.id);
                              setOpenPopover(null);
                            }}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                              activeModel
                                ? 'bg-blue-500/18 font-semibold text-blue-500 dark:text-blue-300'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <div>
                              <div>{m.label}</div>
                              <div className="text-[10.5px] font-normal text-[var(--text-muted)]">
                                {m.description}
                              </div>
                            </div>
                            {activeModel && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openPopover === 'ratio' && (
        <div
          className={`absolute left-0 z-40 w-72 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl sm:left-24 ${popoverPositionClass}`}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="mb-2 text-xs font-semibold text-[var(--text-primary)]">
            Tỉ lệ khung hình
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECT_RATIOS.map((ar) => {
              const active = ar.id === aspectRatioId;
              return (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => {
                    onAspectRatioChange(ar.id);
                    setOpenPopover(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition ${
                    active
                      ? 'border-blue-500 bg-blue-500/15 text-blue-500 dark:text-blue-300'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <div className="flex h-5 items-center justify-center">
                    <div
                      style={{ width: ar.previewW, height: ar.previewH }}
                      className={`rounded-[3px] border ${
                        active
                          ? 'border-blue-400 bg-blue-500/25'
                          : 'border-current opacity-60'
                      }`}
                    />
                  </div>
                  <div className="text-center leading-tight">
                    <div className="font-mono-code text-[11px] font-semibold">
                      {ar.label}
                    </div>
                    <div className="text-[9.5px] opacity-75">{ar.tag}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {openPopover === 'style' && (
        <div
          className={`absolute left-0 z-40 w-full max-w-md rounded-2xl border p-3 shadow-2xl backdrop-blur-xl sm:left-32 ${popoverPositionClass}`}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="mb-2 text-xs font-semibold text-[var(--text-primary)]">
            Phong cách nghệ thuật
          </div>
          <div className="grid max-h-[280px] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
            {STYLE_PRESETS.map((preset) => {
              const active = preset.id === styleId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onStyleChange(preset.id);
                    setOpenPopover(null);
                  }}
                  className={`relative overflow-hidden rounded-xl border p-2.5 text-left transition ${
                    active
                      ? 'border-blue-400 ring-2 ring-blue-500/35'
                      : 'border-[var(--border-subtle)] hover:border-blue-400/50'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${preset.gradient}`}
                  />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold text-white">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-white/75">
                      {preset.enName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {openPopover === 'advanced' && (
        <div
          className={`absolute right-0 z-40 w-80 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl ${popoverPositionClass}`}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="space-y-3.5">
            {/* Batch count */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Số ảnh mỗi lượt
                </span>
                <span className="font-mono-code text-[11px] text-[var(--text-muted)]">
                  {batchCount} ảnh
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-subtle)] p-1">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onBatchCountChange(n)}
                    className={`rounded-lg py-1.5 font-mono-code text-xs font-semibold transition ${
                      batchCount === n
                        ? 'meta-gradient-btn text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    {n} ảnh
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Magic */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Prompt Magic
                </div>
                <div className="text-[10.5px] text-[var(--text-muted)]">
                  Tự tăng độ sắc nét & ánh sáng
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={promptMagic}
                onClick={() => onPromptMagicChange(!promptMagic)}
                className={`relative h-5 w-9 rounded-full transition ${
                  promptMagic ? 'bg-blue-500' : 'bg-zinc-600/60'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    promptMagic ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto Remove Logo */}
            <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 p-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                    <Eraser className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Tự động xóa logo</span>
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)]">
                    Làm sạch watermark góc dưới phải ngay khi tạo
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoRemoveLogo}
                  onClick={() => onAutoRemoveLogoChange(!autoRemoveLogo)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    autoRemoveLogo ? 'bg-emerald-500' : 'bg-zinc-600/60'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      autoRemoveLogo ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {autoRemoveLogo && (
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onLogoRemovalModeChange('inpaint')}
                    className={`rounded-lg border px-2 py-1.5 text-left text-[11px] transition ${
                      logoRemovalMode === 'inpaint'
                        ? 'border-emerald-500/50 bg-emerald-500/15 font-semibold text-emerald-600 dark:text-emerald-300'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <div>Inpaint thông minh</div>
                    <div className="text-[9.5px] font-normal opacity-75">
                      Giữ nguyên khung ảnh
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogoRemovalModeChange('crop')}
                    className={`rounded-lg border px-2 py-1.5 text-left text-[11px] transition ${
                      logoRemovalMode === 'crop'
                        ? 'border-emerald-500/50 bg-emerald-500/15 font-semibold text-emerald-600 dark:text-emerald-300'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <div>Cắt mép siêu nét</div>
                    <div className="text-[9.5px] font-normal opacity-75">
                      Sạch 100%, không vết
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                Negative Prompt
              </label>
              <textarea
                rows={2}
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                placeholder="blurry, watermark, low quality..."
                className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-2 text-[11.5px] text-[var(--text-primary)] outline-none focus:border-blue-500"
              />
            </div>

            {/* Seed */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  Seed
                </label>
                <button
                  type="button"
                  onClick={() => onLockSeedChange(!lockSeed)}
                  className="flex items-center gap-1 text-[10.5px] text-blue-500 dark:text-blue-400"
                >
                  {lockSeed ? (
                    <>
                      <Lock className="h-3 w-3" /> Đang khóa
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3" /> Ngẫu nhiên
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={seed}
                  onChange={(e) =>
                    onSeedChange(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="Tự động"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1.5 font-mono-code text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    onSeedChange(String(Math.floor(Math.random() * 2147483647)))
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                >
                  <Dices className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Omnibox Shell */}
      <div className="meta-omnibox rounded-[28px] p-3 sm:p-3.5">
        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="mb-2.5 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/60 p-2">
            <img
              src={attachedImage.dataUrl}
              alt={attachedImage.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[var(--text-primary)]">
                {attachedImage.name}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {currentProvider.supportsImageEdit
                  ? '✦ Gemini sẽ chỉnh sửa trực tiếp trên ảnh này'
                  : 'Ảnh tham chiếu • Chọn Google Gemini để chỉnh sửa trực tiếp ảnh gốc'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAttachImage(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-rose-500/20 hover:text-rose-400"
              title="Bỏ ảnh đính kèm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Prompt Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            placeholder ||
            (isFollowUpMode
              ? 'Mô tả điều bạn muốn chỉnh sửa thêm (VD: thêm tuyết rơi, đổi sang hoàng hôn, hoặc tạo cảnh mới)...'
              : 'Tưởng tượng bất cứ điều gì... (VD: Phố cổ Hội An đêm mưa đèn lồng lung linh)')
          }
          className="w-full resize-none bg-transparent px-2 pt-0.5 text-sm leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none sm:text-[15px]"
        />

        {/* Bottom Pill Toolbar inside Omnibox */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFilePicked(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            {/* Attach image */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Tải ảnh lên để chỉnh sửa / tham chiếu"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <ImagePlus className="h-4 w-4" />
            </button>

            {/* Provider / Model Pill */}
            <button
              type="button"
              onClick={() =>
                setOpenPopover((v) => (v === 'provider' ? null : 'provider'))
              }
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                openPopover === 'provider'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-500 dark:text-blue-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="max-w-[125px] truncate">{currentModel.label}</span>
              {currentProvider.isFree && (
                <span className="hidden rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9.5px] font-semibold text-emerald-500 sm:inline dark:text-emerald-300">
                  Free
                </span>
              )}
            </button>

            {/* Aspect Ratio Pill */}
            <button
              type="button"
              onClick={() =>
                setOpenPopover((v) => (v === 'ratio' ? null : 'ratio'))
              }
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono-code text-xs font-medium transition ${
                openPopover === 'ratio'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-500 dark:text-blue-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Ratio className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>{currentRatio.label}</span>
            </button>

            {/* Style Pill */}
            <button
              type="button"
              onClick={() =>
                setOpenPopover((v) => (v === 'style' ? null : 'style'))
              }
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                openPopover === 'style'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-500 dark:text-blue-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Palette className="h-3.5 w-3.5 text-fuchsia-500 dark:text-fuchsia-400" />
              <span>{currentStyle.name}</span>
            </button>

            {/* Auto Remove Logo Quick Toggle Pill */}
            <button
              type="button"
              onClick={() => onAutoRemoveLogoChange(!autoRemoveLogo)}
              title={
                autoRemoveLogo
                  ? `Đang bật tự động xóa logo (${logoRemovalMode === 'inpaint' ? 'Inpaint' : 'Cắt mép'}) — bấm để tắt`
                  : 'Đang tắt tự động xóa logo — bấm để bật'
              }
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                autoRemoveLogo
                  ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xóa logo</span>
            </button>

            {/* Advanced / Batch Pill */}
            <button
              type="button"
              onClick={() =>
                setOpenPopover((v) => (v === 'advanced' ? null : 'advanced'))
              }
              title="Số lượng ảnh, Negative Prompt & Seed"
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                openPopover === 'advanced'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-500 dark:text-blue-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="font-mono-code text-[11px]">{batchCount}×</span>
            </button>
          </div>

          {/* Right: Sparkle Enhance + Send Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onMagicEnhance}
              disabled={!prompt.trim()}
              title="Tự động nâng cấp Prompt chi tiết hơn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] text-blue-500 transition hover:border-blue-500/40 hover:bg-blue-500/12 disabled:cursor-not-allowed disabled:opacity-35 dark:text-blue-400"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {isGenerating ? (
              <button
                type="button"
                onClick={onCancel}
                title="Dừng tạo"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  onSubmit();
                }}
                disabled={!prompt.trim()}
                title="Tạo ảnh (Enter)"
                className="meta-gradient-btn flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
