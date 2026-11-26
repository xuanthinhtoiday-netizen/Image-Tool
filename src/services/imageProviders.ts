import {
  ApiKeys,
  AspectRatioOption,
  AttachedImage,
  ProviderId,
} from '../types/studio';

export interface GenerateParams {
  providerId: ProviderId;
  modelId: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatioOption;
  seed: number;
  apiKeys: ApiKeys;
  referenceImage?: AttachedImage;
  signal?: AbortSignal;
  onStatus?: (statusText: string, progress?: number) => void;
}

export interface GenerateResult {
  imageUrl: string;
  width: number;
  height: number;
  seed: number;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Đã hủy tạo ảnh', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Đã hủy tạo ảnh', 'AbortError'));
      },
      { once: true }
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Không thể đọc dữ liệu ảnh'));
    };
    reader.onerror = () => reject(new Error('Lỗi đọc dữ liệu ảnh'));
    reader.readAsDataURL(blob);
  });
}

async function generateWithPollinationsFree(
  params: GenerateParams
): Promise<GenerateResult> {
  const { prompt, modelId, aspectRatio, seed, signal, onStatus } = params;
  const encodedPrompt = encodeURIComponent(prompt);
  const query = new URLSearchParams({
    width: String(aspectRatio.width),
    height: String(aspectRatio.height),
    model: modelId || 'flux',
    seed: String(seed),
    nologo: 'true',
  });
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${query.toString()}`;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onStatus?.(
      attempt === 1
        ? `Đang kết nối Pollinations (${modelId})...`
        : `Đang thử lại lần ${attempt}/${maxAttempts}...`,
      attempt === 1 ? 25 : 45
    );

    const response = await fetch(url, { signal });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        throw new Error('Server trả về định dạng không phải ảnh. Hãy thử chuyển sang AI Horde Free.');
      }
      onStatus?.('Đang hoàn thiện độ nét ảnh...', 90);
      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      return {
        imageUrl: dataUrl,
        width: aspectRatio.width,
        height: aspectRatio.height,
        seed,
      };
    }

    if (response.status === 503 || response.status === 429) {
      const retryAfterSec = Math.min(
        12,
        Math.max(4, Number(response.headers.get('retry-after')) || 6)
      );
      if (attempt < maxAttempts) {
        for (let sec = retryAfterSec; sec > 0; sec--) {
          onStatus?.(`Pollinations đang đông — tự thử lại sau ${sec}s...`, 30);
          await sleep(1000, signal);
        }
        continue;
      }
      throw new Error(
        'Pollinations Free đang quá tải tạm thời. Bạn có thể bấm thử lại, chuyển sang "AI Horde GPU Cộng đồng (Miễn phí)" hoặc nhập Pollinations API Key.'
      );
    }

    let detail = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message || errJson?.message || detail;
    } catch {
      // ignore parse error
    }

    if (/free limit|retry after/i.test(detail)) {
      const match = detail.match(/retry after\s+(\d+)s/i);
      const waitSec = match ? match[1] : 'vài chục';
      throw new Error(
        `Pollinations Free giới hạn 1 ảnh mỗi 45 giây theo IP (chờ thêm ~${waitSec}s). Bạn có thể chuyển sang "AI Horde Free" để tạo ngay hoặc nhập Pollinations API Key.`
      );
    }

    throw new Error(`Pollinations lỗi: ${detail}`);
  }

  throw new Error('Không thể tạo ảnh từ Pollinations lúc này.');
}

async function generateWithPollinationsPro(
  params: GenerateParams
): Promise<GenerateResult> {
  const { prompt, modelId, aspectRatio, seed, apiKeys, signal, onStatus } = params;
  const key = apiKeys.pollinationsKey.trim();
  if (!key) {
    throw new Error('Vui lòng nhập Pollinations API Key trong mục Cài đặt API Key.');
  }

  onStatus?.(`Đang tạo ảnh tốc độ cao với ${modelId}...`, 35);
  const encodedPrompt = encodeURIComponent(prompt);
  const query = new URLSearchParams({
    model: modelId,
    width: String(aspectRatio.width),
    height: String(aspectRatio.height),
    seed: String(seed),
    nologo: 'true',
  });

  const response = await fetch(
    `https://gen.pollinations.ai/image/${encodedPrompt}?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      signal,
    }
  );

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err?.error?.message || err?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(`Pollinations Pro lỗi: ${msg}`);
  }

  onStatus?.('Đang tải ảnh về Studio...', 90);
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  return {
    imageUrl: dataUrl,
    width: aspectRatio.width,
    height: aspectRatio.height,
    seed,
  };
}

function getAiHordeDimensions(
  aspectRatio: AspectRatioOption,
  hasPersonalKey: boolean
): { width: number; height: number } {
  // Anonymous key on AI Horde supports free jobs up to 576x576 pixels without upfront kudos
  const maxSide = hasPersonalKey ? 1024 : 576;
  const ratio = aspectRatio.width / aspectRatio.height;
  let w: number;
  let h: number;

  if (ratio >= 1) {
    w = maxSide;
    h = Math.round(maxSide / ratio);
  } else {
    h = maxSide;
    w = Math.round(maxSide * ratio);
  }

  // Round to nearest multiple of 64 (required by Stable Diffusion / AI Horde)
  w = Math.max(256, Math.round(w / 64) * 64);
  h = Math.max(256, Math.round(h / 64) * 64);
  return { width: w, height: h };
}

async function generateWithAiHorde(
  params: GenerateParams
): Promise<GenerateResult> {
  const { prompt, negativePrompt, modelId, aspectRatio, seed, apiKeys, signal, onStatus } =
    params;

  const customKey = apiKeys.aihordeKey.trim();
  const apiKey = customKey || '0000000000';
  const dims = getAiHordeDimensions(aspectRatio, Boolean(customKey));
  const combinedPrompt = negativePrompt.trim()
    ? `${prompt} ### ${negativePrompt.trim()}`
    : prompt;

  onStatus?.('Đang gửi yêu cầu tới mạng GPU AI Horde...', 15);

  const submitRes = await fetch('https://aihorde.net/api/v2/generate/async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      'Client-Agent': 'LuminaStudio:1.0:web',
    },
    body: JSON.stringify({
      prompt: combinedPrompt,
      params: {
        width: dims.width,
        height: dims.height,
        steps: 22,
        cfg_scale: 7,
        seed: String(seed),
        n: 1,
      },
      models: [modelId],
      nsfw: false,
      censor_nsfw: true,
      r2: true,
      shared: false,
    }),
    signal,
  });

  if (!submitRes.ok) {
    let msg = `HTTP ${submitRes.status}`;
    try {
      const err = await submitRes.json();
      msg = err?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(`AI Horde từ chối yêu cầu: ${msg}`);
  }

  const submitData = (await submitRes.json()) as { id?: string; message?: string };
  if (!submitData.id) {
    throw new Error(submitData.message || 'AI Horde không trả về mã tác vụ.');
  }

  const jobId = submitData.id;
  const maxPolls = 60; // ~3 minutes max

  for (let i = 0; i < maxPolls; i++) {
    await sleep(3000, signal);

    const checkRes = await fetch(
      `https://aihorde.net/api/v2/generate/check/${jobId}`,
      {
        headers: { 'Client-Agent': 'LuminaStudio:1.0:web' },
        signal,
      }
    );

    if (!checkRes.ok) continue;

    const status = (await checkRes.json()) as {
      done: boolean;
      faulted: boolean;
      wait_time: number;
      queue_position: number;
      processing: number;
      is_possible: boolean;
    };

    if (status.faulted) {
      throw new Error('GPU cộng đồng gặp lỗi khi render. Hãy thử lại hoặc đổi model khác.');
    }

    if (!status.is_possible) {
      throw new Error(
        `Model "${modelId}" hiện không có GPU trực tuyến. Hãy chọn Deliberate hoặc ICBINP.`
      );
    }

    if (status.done) {
      onStatus?.('Đã vẽ xong! Đang tải ảnh về Studio...', 92);
      const resultRes = await fetch(
        `https://aihorde.net/api/v2/generate/status/${jobId}`,
        {
          headers: { 'Client-Agent': 'LuminaStudio:1.0:web' },
          signal,
        }
      );
      if (!resultRes.ok) {
        throw new Error('Không thể tải kết quả từ AI Horde.');
      }
      const resultData = (await resultRes.json()) as {
        generations?: Array<{ img: string; seed: string }>;
      };
      const gen = resultData.generations?.[0];
      if (!gen?.img) {
        throw new Error('AI Horde không trả về ảnh hợp lệ.');
      }

      // Convert remote R2 URL to data URL so it persists cleanly in IndexedDB
      let imageUrl = gen.img;
      if (imageUrl.startsWith('http')) {
        try {
          const imgRes = await fetch(imageUrl, { signal });
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            imageUrl = await blobToDataUrl(blob);
          }
        } catch {
          // Keep remote URL if CORS blocks blob conversion
        }
      } else if (!imageUrl.startsWith('data:')) {
        imageUrl = `data:image/webp;base64,${imageUrl}`;
      }

      return {
        imageUrl,
        width: dims.width,
        height: dims.height,
        seed: Number(gen.seed) || seed,
      };
    }

    if (status.processing > 0) {
      onStatus?.(
        `GPU đang vẽ tác phẩm của bạn (~${Math.max(3, status.wait_time)}s)...`,
        75
      );
    } else {
      const pos = status.queue_position > 0 ? `#${status.queue_position}` : 'sắp tới lượt';
      onStatus?.(
        `AI Horde • Hàng đợi ${pos} • Dự kiến ~${status.wait_time}s`,
        Math.min(68, 20 + i * 2)
      );
    }
  }

  throw new Error('Hết thời gian chờ AI Horde. Hãy thử chọn model có hàng đợi ngắn hơn.');
}

async function generateWithGemini(params: GenerateParams): Promise<GenerateResult> {
  const {
    prompt,
    negativePrompt,
    modelId,
    aspectRatio,
    seed,
    apiKeys,
    referenceImage,
    signal,
    onStatus,
  } = params;
  const key = apiKeys.geminiKey.trim();
  if (!key) {
    throw new Error('Vui lòng nhập Google Gemini API Key trong mục Cài đặt API Key.');
  }

  onStatus?.(
    referenceImage
      ? `Đang chỉnh sửa ảnh với Google ${modelId}...`
      : `Đang tạo ảnh với Google ${modelId}...`,
    35
  );

  const fullPrompt = negativePrompt.trim()
    ? `${prompt}\n\nAvoid including: ${negativePrompt.trim()}`
    : prompt;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  const requestParts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [];

  if (referenceImage?.dataUrl) {
    const base64 = referenceImage.dataUrl.includes(',')
      ? referenceImage.dataUrl.split(',')[1]
      : referenceImage.dataUrl;
    requestParts.push({
      inlineData: {
        mimeType: referenceImage.mimeType || 'image/png',
        data: base64,
      },
    });
  }
  requestParts.push({ text: fullPrompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      contents: [{ parts: requestParts }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          aspectRatio: aspectRatio.geminiRatio,
        },
      },
    }),
    signal,
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err?.error?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(`Gemini API lỗi: ${msg}`);
  }

  const data = await response.json();
  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> =
    data?.candidates?.[0]?.content?.parts || [];

  const imgPart = parts.find(
    (p) => p.inlineData && p.inlineData.mimeType?.startsWith('image/')
  );

  if (!imgPart?.inlineData) {
    const textHint = parts.find((p) => p.text)?.text;
    throw new Error(
      textHint
        ? `Gemini không trả về ảnh: ${textHint.slice(0, 140)}`
        : 'Gemini không trả về dữ liệu ảnh. Hãy thử diễn đạt lại prompt.'
    );
  }

  onStatus?.('Đang giải mã ảnh từ Gemini...', 92);
  const imageUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;

  return {
    imageUrl,
    width: aspectRatio.width,
    height: aspectRatio.height,
    seed,
  };
}

async function generateWithOpenAI(params: GenerateParams): Promise<GenerateResult> {
  const { prompt, negativePrompt, modelId, aspectRatio, seed, apiKeys, signal, onStatus } =
    params;
  const key = apiKeys.openaiKey.trim();
  if (!key) {
    throw new Error('Vui lòng nhập OpenAI API Key trong mục Cài đặt API Key.');
  }

  onStatus?.(`Đang tạo ảnh với OpenAI ${modelId}...`, 40);

  const fullPrompt = negativePrompt.trim()
    ? `${prompt}. Avoid: ${negativePrompt.trim()}`
    : prompt;

  const isDalle3 = modelId === 'dall-e-3';
  const size = isDalle3
    ? aspectRatio.width > aspectRatio.height
      ? '1792x1024'
      : aspectRatio.height > aspectRatio.width
        ? '1024x1792'
        : '1024x1024'
    : aspectRatio.openaiSize;

  const body: Record<string, unknown> = {
    model: modelId,
    prompt: fullPrompt,
    n: 1,
    size,
  };
  if (isDalle3) {
    body.response_format = 'b64_json';
    body.quality = 'hd';
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err?.error?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(`OpenAI API lỗi: ${msg}`);
  }

  const data = await response.json();
  const item = data?.data?.[0];
  if (!item) throw new Error('OpenAI không trả về dữ liệu ảnh.');

  const imageUrl = item.b64_json
    ? `data:image/png;base64,${item.b64_json}`
    : item.url;

  return {
    imageUrl,
    width: aspectRatio.width,
    height: aspectRatio.height,
    seed,
  };
}

async function generateWithHuggingFace(
  params: GenerateParams
): Promise<GenerateResult> {
  const { prompt, negativePrompt, modelId, aspectRatio, seed, apiKeys, signal, onStatus } =
    params;
  const key = apiKeys.huggingfaceKey.trim();
  if (!key) {
    throw new Error('Vui lòng nhập Hugging Face Token trong mục Cài đặt API Key.');
  }

  onStatus?.(`Đang chạy ${modelId} trên Hugging Face...`, 35);

  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${modelId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt.trim() || undefined,
          width: Math.min(1024, Math.round(aspectRatio.width / 64) * 64),
          height: Math.min(1024, Math.round(aspectRatio.height / 64) * 64),
        },
      }),
      signal,
    }
  );

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err?.error || msg;
    } catch {
      // ignore
    }
    throw new Error(`Hugging Face lỗi: ${msg}`);
  }

  onStatus?.('Đang hoàn tất tải ảnh...', 90);
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  return {
    imageUrl: dataUrl,
    width: aspectRatio.width,
    height: aspectRatio.height,
    seed,
  };
}

export async function generateImage(params: GenerateParams): Promise<GenerateResult> {
  switch (params.providerId) {
    case 'pollinations-free':
      return generateWithPollinationsFree(params);
    case 'aihorde-free':
      return generateWithAiHorde(params);
    case 'pollinations-pro':
      return generateWithPollinationsPro(params);
    case 'gemini':
      return generateWithGemini(params);
    case 'openai':
      return generateWithOpenAI(params);
    case 'huggingface':
      return generateWithHuggingFace(params);
    default:
      throw new Error('Nguồn AI không được hỗ trợ.');
  }
}
