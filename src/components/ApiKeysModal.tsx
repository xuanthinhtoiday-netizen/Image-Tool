import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ApiKeys } from '../types/studio';

interface ApiKeysModalProps {
  open: boolean;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
}

interface KeyFieldMeta {
  field: keyof ApiKeys;
  label: string;
  badge: string;
  placeholder: string;
  url: string;
  hint: string;
}

const KEY_FIELDS: KeyFieldMeta[] = [
  {
    field: 'pollinationsKey',
    label: 'Pollinations Pro API Key',
    badge: 'FLUX / Z-Image / SD 3.5',
    placeholder: 'pk_... hoặc sk_...',
    url: 'https://enter.pollinations.ai/',
    hint: 'Có gói tặng miễn phí sau khi đăng nhập, mở khóa hàng chục model siêu nhanh không giới hạn 45s.',
  },
  {
    field: 'geminiKey',
    label: 'Google Gemini API Key',
    badge: 'Tạo & Chỉnh sửa ảnh',
    placeholder: 'AIzaSy...',
    url: 'https://aistudio.google.com/apikey',
    hint: 'Lấy trực tiếp tại Google AI Studio. Hỗ trợ chỉnh sửa trực tiếp ảnh tải lên & hiểu tiếng Việt chuẩn.',
  },
  {
    field: 'openaiKey',
    label: 'OpenAI API Key',
    badge: 'GPT Image 1 / DALL·E 3',
    placeholder: 'sk-proj-...',
    url: 'https://platform.openai.com/api-keys',
    hint: 'Hỗ trợ GPT Image 1 và DALL-E 3 độ nét cao.',
  },
  {
    field: 'huggingfaceKey',
    label: 'Hugging Face Access Token',
    badge: 'FLUX.1-dev / SDXL',
    placeholder: 'hf_...',
    url: 'https://huggingface.co/settings/tokens',
    hint: 'Token quyền Inference Providers để gọi các model open-source trên Hugging Face.',
  },
  {
    field: 'aihordeKey',
    label: 'AI Horde Key (Tùy chọn)',
    badge: 'Ưu tiên hàng đợi Free',
    placeholder: 'Để trống sẽ dùng 0000000000 miễn phí',
    url: 'https://stablehorde.net/register',
    hint: 'Không bắt buộc. Đăng ký miễn phí để được ưu tiên hàng đợi và tăng độ phân giải.',
  },
];

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  open,
  apiKeys,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<ApiKeys>(apiKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(apiKeys);
      setSavedNotice(false);
    }
  }, [open, apiKeys]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 550);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-strong)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
                Cấu hình API Keys (Tùy chọn)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Mở khóa thêm Gemini (sửa ảnh trực tiếp), OpenAI, Pollinations Pro & HF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-140px)] space-y-3.5 overflow-y-auto px-6 py-5"
        >
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3 text-xs text-emerald-600 dark:text-emerald-200/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p className="leading-relaxed">
              API Key chỉ được lưu cục bộ trong{' '}
              <code className="rounded bg-black/10 px-1 py-0.5 font-mono-code text-[11px] dark:bg-black/30">
                localStorage
              </code>{' '}
              trên trình duyệt của bạn. Bạn vẫn dùng được 2 nguồn <strong>Miễn phí</strong> mà không cần nhập key nào.
            </p>
          </div>

          {KEY_FIELDS.map((item) => {
            const val = draft[item.field];
            const isShown = Boolean(visible[item.field]);
            return (
              <div
                key={item.field}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5"
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      {item.label}
                    </label>
                    <span className="rounded-full bg-blue-500/12 px-2 py-0.5 text-[10px] font-medium text-blue-500 dark:text-blue-300">
                      {item.badge}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:underline dark:text-blue-400"
                  >
                    <span>Lấy Key</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={isShown ? 'text' : 'password'}
                    value={val}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [item.field]: e.target.value,
                      }))
                    }
                    placeholder={item.placeholder}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-2 pr-10 pl-3 font-mono-code text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVisible((prev) => ({
                        ...prev,
                        [item.field]: !prev[item.field],
                      }))
                    }
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {isShown ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                  {item.hint}
                </p>
              </div>
            );
          })}

          <div
            className="flex items-center justify-end gap-2 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="meta-gradient-btn flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white"
            >
              {savedNotice ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu cấu hình</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
