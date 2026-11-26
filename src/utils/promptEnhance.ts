import { StylePreset } from '../types/studio';

const MAGIC_ENHANCERS = [
  'masterpiece quality',
  'exquisite lighting and atmospheric depth',
  'harmonious composition',
  'crisp micro-details',
  'rich tonal contrast',
  'high-resolution finish',
];

export function enhancePromptText(raw: string, style?: StylePreset): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  const lower = cleaned.toLowerCase();
  const additions: string[] = [];

  if (style && style.promptSuffix && !lower.includes(style.enName.toLowerCase())) {
    additions.push(style.promptSuffix);
  }

  for (const token of MAGIC_ENHANCERS) {
    const key = token.split(' ')[0];
    if (!lower.includes(key)) {
      additions.push(token);
    }
    if (additions.length >= 4) break;
  }

  return `${cleaned.replace(/[.,;]+$/, '')}, ${additions.join(', ')}`;
}

export function composeFinalPrompt(
  rawPrompt: string,
  style: StylePreset,
  promptMagic: boolean
): string {
  const trimmed = rawPrompt.trim();
  if (!trimmed) return '';

  const parts: string[] = [trimmed];
  if (style.promptSuffix) {
    parts.push(style.promptSuffix);
  }
  if (promptMagic) {
    parts.push('highly detailed, balanced composition, luminous lighting, ultra sharp focus');
  }
  return parts.join(', ');
}

export async function downloadImageFile(url: string, baseName: string): Promise<void> {
  const safeName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'lumina-artwork';

  try {
    let href = url;
    let shouldRevoke = false;
    let ext = 'png';

    if (url.startsWith('data:image/')) {
      const mimeMatch = url.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
      if (mimeMatch?.[1]) {
        ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
      }
    } else {
      const res = await fetch(url);
      const blob = await res.blob();
      if (blob.type.includes('jpeg')) ext = 'jpg';
      else if (blob.type.includes('webp')) ext = 'webp';
      href = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    const link = document.createElement('a');
    link.href = href;
    link.download = `${safeName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(href), 2000);
    }
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
