import {
  AspectRatioOption,
  InspirationItem,
  ProviderConfig,
  StylePreset,
} from '../types/studio';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'pollinations-free',
    name: 'Pollinations FLUX (Miễn phí)',
    shortName: 'Pollinations Free',
    isFree: true,
    requiresKey: false,
    description: 'Chạy ngay không cần API Key. Phù hợp tạo ảnh nhanh và đẹp.',
    models: [
      {
        id: 'flux',
        label: 'FLUX.1 Classic',
        badge: 'Mặc định',
        description: 'Cân bằng hoàn hảo giữa độ chi tiết, bố cục và ánh sáng.',
      },
      {
        id: 'turbo',
        label: 'FLUX Turbo',
        badge: 'Nhanh',
        description: 'Tạo ảnh siêu tốc để thử nhiều ý tưởng liên tiếp.',
      },
    ],
  },
  {
    id: 'aihorde-free',
    name: 'AI Horde GPU Cộng đồng (Miễn phí)',
    shortName: 'AI Horde Free',
    isFree: true,
    requiresKey: false,
    keyLabel: 'AI Horde Key (Tùy chọn ưu tiên hàng đợi)',
    keyPlaceholder: '0000000000 (mặc định ẩn danh miễn phí)',
    keyUrl: 'https://stablehorde.net/register',
    description: 'Mạng lưới GPU mã nguồn mở miễn phí 100%, nhiều model siêu thực & anime.',
    models: [
      {
        id: 'Deliberate',
        label: 'Deliberate v3',
        badge: 'Ổn định',
        description: 'Đa năng, nghệ thuật, hàng đợi nhanh.',
      },
      {
        id: "ICBINP - I Can't Believe It's Not Photography",
        label: 'ICBINP Photoreal',
        badge: 'Siêu thực',
        description: 'Chuyên ảnh chụp thực tế, ánh sáng & da cực tự nhiên.',
      },
      {
        id: 'AbsoluteReality',
        label: 'AbsoluteReality',
        badge: 'Chân dung',
        description: 'Xuất sắc cho ảnh chân dung điện ảnh và phong cảnh.',
      },
      {
        id: 'Nova Anime XL',
        label: 'Nova Anime XL',
        badge: 'Anime',
        description: 'Chuyên minh họa Anime chất lượng cao sắc nét.',
      },
      {
        id: 'AlbedoBase XL 3.1',
        label: 'AlbedoBase XL 3.1',
        badge: 'SDXL',
        description: 'Model SDXL đa phong cách từ 3D đến Digital Art.',
      },
      {
        id: 'AIO Pixel Art',
        label: 'AIO Pixel Art',
        badge: 'Pixel',
        description: 'Chuyên đồ họa Pixel Art retro sắc nét.',
      },
    ],
  },
  {
    id: 'pollinations-pro',
    name: 'Pollinations Pro (API Key)',
    shortName: 'Pollinations Pro',
    isFree: false,
    requiresKey: true,
    keyLabel: 'Pollinations API Key',
    keyPlaceholder: 'pk_... hoặc sk_...',
    keyUrl: 'https://enter.pollinations.ai/',
    description: 'Tốc độ cao, không giới hạn 45s/lượt, mở khóa Z-Image Turbo & SD 3.5.',
    models: [
      {
        id: 'black-forest-labs/flux.1-schnell',
        label: 'FLUX.1 Schnell',
        badge: 'Siêu tốc',
        description: 'Model FLUX.1 siêu nhanh và sắc nét từ Black Forest Labs.',
      },
      {
        id: 'tongyi-mai/z-image-turbo',
        label: 'Z-Image Turbo',
        badge: 'Sắc nét',
        description: 'Tạo ảnh độ nét cao tích hợp upscale tự động.',
      },
      {
        id: 'stability-ai/stable-diffusion-3.5-large',
        label: 'SD 3.5 Large',
        badge: 'Pro',
        description: 'Độ bám sát prompt và typography cực ấn tượng.',
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini Image',
    shortName: 'Gemini API',
    isFree: false,
    requiresKey: true,
    supportsImageEdit: true,
    keyLabel: 'Google AI Studio API Key',
    keyPlaceholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/apikey',
    description: 'Hỗ trợ cả Tạo ảnh & Chỉnh sửa trực tiếp ảnh tải lên, hiểu tiếng Việt siêu chuẩn.',
    models: [
      {
        id: 'gemini-2.5-flash-image',
        label: 'Gemini 2.5 Flash Image',
        badge: 'Edit ảnh + TV',
        description: 'Hỗ trợ chỉnh sửa ảnh trực tiếp & viết chữ trong ảnh chuẩn xác.',
      },
      {
        id: 'gemini-2.0-flash-exp-image-generation',
        label: 'Gemini 2.0 Flash Image',
        badge: 'Classic',
        description: 'Phiên bản tạo ảnh đa phương thức tốc độ cao.',
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI Image Studio',
    shortName: 'OpenAI',
    isFree: false,
    requiresKey: true,
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    description: 'Dùng trực tiếp GPT Image 1 hoặc DALL-E 3 bằng key OpenAI của bạn.',
    models: [
      {
        id: 'gpt-image-1',
        label: 'GPT Image 1',
        badge: 'Mới nhất',
        description: 'Độ chi tiết, ánh sáng và chữ viết vượt trội.',
      },
      {
        id: 'dall-e-3',
        label: 'DALL·E 3 HD',
        badge: 'Nghệ thuật',
        description: 'Bố cục sáng tạo, màu sắc rực rỡ.',
      },
    ],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    shortName: 'Hugging Face',
    isFree: false,
    requiresKey: true,
    keyLabel: 'Hugging Face Access Token',
    keyPlaceholder: 'hf_...',
    keyUrl: 'https://huggingface.co/settings/tokens',
    description: 'Chạy các model mã nguồn mở đình đám qua Inference API của Hugging Face.',
    models: [
      {
        id: 'black-forest-labs/FLUX.1-schnell',
        label: 'FLUX.1-schnell',
        badge: 'Hot',
        description: 'FLUX nhanh và đẹp bậc nhất cộng đồng mã nguồn mở.',
      },
      {
        id: 'black-forest-labs/FLUX.1-dev',
        label: 'FLUX.1-dev',
        badge: 'Chi tiết cao',
        description: 'Chất lượng nghệ thuật tối đa, chi tiết tinh xảo.',
      },
      {
        id: 'stabilityai/stable-diffusion-xl-base-1.0',
        label: 'SDXL Base 1.0',
        badge: 'SDXL',
        description: 'Chuẩn mực ổn định cho mọi phong cách.',
      },
    ],
  },
];

export const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: '1:1',
    label: '1:1',
    tag: 'Vuông',
    width: 1024,
    height: 1024,
    geminiRatio: '1:1',
    openaiSize: '1024x1024',
    previewW: 16,
    previewH: 16,
  },
  {
    id: '16:9',
    label: '16:9',
    tag: 'Điện ảnh',
    width: 1280,
    height: 720,
    geminiRatio: '16:9',
    openaiSize: '1536x1024',
    previewW: 22,
    previewH: 13,
  },
  {
    id: '9:16',
    label: '9:16',
    tag: 'Story / Reels',
    width: 720,
    height: 1280,
    geminiRatio: '9:16',
    openaiSize: '1024x1536',
    previewW: 12,
    previewH: 20,
  },
  {
    id: '4:3',
    label: '4:3',
    tag: 'Cổ điển',
    width: 1024,
    height: 768,
    geminiRatio: '4:3',
    openaiSize: '1536x1024',
    previewW: 19,
    previewH: 14,
  },
  {
    id: '3:4',
    label: '3:4',
    tag: 'Chân dung',
    width: 768,
    height: 1024,
    geminiRatio: '3:4',
    openaiSize: '1024x1536',
    previewW: 14,
    previewH: 19,
  },
  {
    id: '21:9',
    label: '21:9',
    tag: 'Siêu rộng',
    width: 1344,
    height: 576,
    geminiRatio: '16:9',
    openaiSize: '1536x1024',
    previewW: 24,
    previewH: 10,
  },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'none',
    name: 'Tự nhiên',
    enName: 'Natural',
    gradient: 'from-slate-600/50 via-zinc-700/40 to-zinc-900/80',
    accent: 'text-zinc-200',
    promptSuffix: '',
  },
  {
    id: 'cinematic',
    name: 'Điện ảnh',
    enName: 'Cinematic',
    gradient: 'from-amber-500/45 via-orange-600/30 to-slate-900/90',
    accent: 'text-amber-300',
    promptSuffix:
      'cinematic film still, anamorphic lens, dramatic volumetric lighting, shallow depth of field, rich color grading, 35mm photography, ultra detailed',
  },
  {
    id: 'photoreal',
    name: 'Siêu thực',
    enName: 'Photoreal',
    gradient: 'from-sky-500/45 via-blue-600/30 to-slate-900/90',
    accent: 'text-sky-300',
    promptSuffix:
      'hyperrealistic photography, shot on Hasselblad X2D 100C, 85mm f/1.4, natural lighting, intricate micro textures, lifelike detail, 8k UHD',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    enName: 'Neon Sci-Fi',
    gradient: 'from-fuchsia-500/45 via-purple-700/35 to-cyan-900/70',
    accent: 'text-fuchsia-300',
    promptSuffix:
      'cyberpunk aesthetic, glowing neon magenta and electric blue reflections on wet asphalt, futuristic atmosphere, volumetric rain fog',
  },
  {
    id: 'anime',
    name: 'Anime',
    enName: 'Studio Key Visual',
    gradient: 'from-rose-500/45 via-pink-600/30 to-indigo-900/70',
    accent: 'text-rose-300',
    promptSuffix:
      'masterpiece anime key visual, Makoto Shinkai inspired sky and lighting, expressive cel shading, luminous clouds, vibrant atmospheric depth',
  },
  {
    id: '3d-octane',
    name: '3D Render',
    enName: 'Octane / C4D',
    gradient: 'from-blue-500/45 via-indigo-600/35 to-slate-900/90',
    accent: 'text-blue-300',
    promptSuffix:
      'stylized 3D render, Octane Render, Unreal Engine 5, subsurface scattering, glass and brushed metal materials, studio softbox lighting',
  },
  {
    id: 'digital-art',
    name: 'Concept Art',
    enName: 'Fantasy Art',
    gradient: 'from-emerald-500/45 via-teal-600/30 to-slate-900/90',
    accent: 'text-emerald-300',
    promptSuffix:
      'epic fantasy concept art, painterly brushstrokes, grand scale atmospheric perspective, trending on ArtStation, intricate storytelling',
  },
  {
    id: 'oil-painting',
    name: 'Sơn dầu',
    enName: 'Fine Oil',
    gradient: 'from-yellow-600/45 via-amber-800/35 to-stone-900/90',
    accent: 'text-yellow-300',
    promptSuffix:
      'museum-grade classical oil painting on canvas, expressive impasto texture, chiaroscuro lighting, rich color palette, fine brushwork',
  },
  {
    id: 'minimalist',
    name: 'Tối giản',
    enName: 'Editorial',
    gradient: 'from-slate-400/35 via-zinc-700/35 to-zinc-950/90',
    accent: 'text-slate-200',
    promptSuffix:
      'ultra minimalist editorial aesthetic, clean architectural geometry, soft diffused studio light, balanced negative space',
  },
  {
    id: 'watercolor',
    name: 'Màu nước',
    enName: 'Watercolor',
    gradient: 'from-cyan-400/45 via-teal-500/30 to-indigo-900/70',
    accent: 'text-cyan-300',
    promptSuffix:
      'delicate hand-painted watercolor illustration on textured cold-press paper, soft pigment blooms, gentle ink outlines, pastel washes',
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    enName: '16-Bit Retro',
    gradient: 'from-lime-500/45 via-emerald-700/30 to-slate-900/90',
    accent: 'text-lime-300',
    promptSuffix:
      'intricate 16-bit pixel art scene, crisp pixel grid, cozy retro video game aesthetic, harmonious color palette, glowing lights',
  },
  {
    id: 'architecture',
    name: 'Kiến trúc',
    enName: 'ArchViz',
    gradient: 'from-orange-400/40 via-stone-600/35 to-zinc-950/90',
    accent: 'text-orange-200',
    promptSuffix:
      'award-winning modern architectural visualization, warm golden hour sunlight through floor-to-ceiling glass, brutalist concrete and natural oak wood',
  },
];

export const QUICK_SUGGESTION_CHIPS = [
  {
    label: 'Phố cổ Hội An đêm đèn lồng',
    prompt:
      'Ancient Hoi An riverside street at twilight after rain, hundreds of glowing silk lanterns reflecting on wet cobblestones and tranquil river water, cinematic lighting',
    styleId: 'cinematic',
    aspectRatio: '16:9',
  },
  {
    label: 'Phi hành gia giữa biển hoa pha lê',
    prompt:
      'A lone astronaut in a sleek white spacesuit standing in an alien bioluminescent meadow of glowing crystal lotus flowers under a giant ringed planet',
    styleId: 'digital-art',
    aspectRatio: '3:4',
  },
  {
    label: 'Quán cà phê Tokyo trong mưa xuân',
    prompt:
      'Cozy two-story corner coffee shop in Tokyo during golden hour spring rain, warm glowing windows, cherry blossom petals drifting across a quiet alley',
    styleId: 'anime',
    aspectRatio: '16:9',
  },
  {
    label: 'Cáo tuyết pha lê 3D phát sáng',
    prompt:
      'An adorable crystalline arctic fox sculpted from frosted glass and liquid gold veins, curled up on a mossy stone surrounded by glowing fireflies',
    styleId: '3d-octane',
    aspectRatio: '1:1',
  },
];

export const QUICK_EDIT_ACTIONS = [
  {
    id: 'variation',
    label: 'Tạo biến thể mới',
    instruction: '',
    overrideStyle: undefined as string | undefined,
  },
  {
    id: 'cinematic-night',
    label: 'Đổi sang đêm mưa neon',
    instruction:
      'reimagined at midnight during gentle rain with glowing neon reflections and moody cinematic atmosphere',
    overrideStyle: 'cyberpunk',
  },
  {
    id: 'golden-hour',
    label: 'Ánh nắng hoàng hôn vàng',
    instruction:
      'bathed in warm golden hour sunset sunlight with long dramatic shadows and ethereal lens flare',
    overrideStyle: 'cinematic',
  },
  {
    id: 'anime-restyle',
    label: 'Chuyển sang Anime',
    instruction: 'reimagined as a breathtaking high-budget Japanese anime film scene',
    overrideStyle: 'anime',
  },
  {
    id: '3d-restyle',
    label: 'Chuyển sang 3D Pixar/Octane',
    instruction: 'reimagined as a charming ultra-detailed stylized 3D render with cinematic softbox lighting',
    overrideStyle: '3d-octane',
  },
];

export const DISCOVER_CATEGORIES = [
  'Tất cả',
  'Việt Nam',
  'Điện ảnh',
  'Anime',
  'Cyberpunk',
  '3D Render',
  'Kiến trúc',
  'Concept Art',
];

export const INSPIRATION_PROMPTS: InspirationItem[] = [
  {
    id: 'insp-1',
    title: 'Phố cổ Hội An đêm đèn lồng',
    category: 'Việt Nam',
    tag: 'Điện ảnh',
    prompt:
      'Ancient Hoi An riverside street at twilight after rain, hundreds of glowing silk lanterns reflecting on wet cobblestones and tranquil river water, wooden boats drifting softly, warm amber and teal cinematic atmosphere',
    styleId: 'cinematic',
    aspectRatio: '16:9',
    gradient: 'from-amber-500/35 via-orange-600/20 to-teal-900/50',
  },
  {
    id: 'insp-2',
    title: 'Vịnh Hạ Long bình minh trên mây',
    category: 'Việt Nam',
    tag: 'Siêu thực',
    prompt:
      'Misty Ha Long Bay limestone karsts emerging from golden morning clouds, a traditional wooden sailboat gliding over mirror-like emerald water, aerial cinematic drone shot',
    styleId: 'photoreal',
    aspectRatio: '16:9',
    gradient: 'from-emerald-500/35 via-cyan-600/20 to-amber-900/40',
  },
  {
    id: 'insp-3',
    title: 'Phi hành gia giữa vườn hoa phát sáng',
    category: 'Concept Art',
    tag: 'Sci-Fi',
    prompt:
      'A lone astronaut in a sleek white ceramic spacesuit standing in an alien bioluminescent meadow of glowing crystal lotus flowers under a colossal ringed gas giant planet in the night sky',
    styleId: 'digital-art',
    aspectRatio: '3:4',
    gradient: 'from-blue-500/35 via-indigo-600/25 to-fuchsia-900/45',
  },
  {
    id: 'insp-4',
    title: 'Quán cà phê Tokyo trong mưa',
    category: 'Anime',
    tag: 'Makoto Style',
    prompt:
      'Cozy two-story corner coffee shop in Tokyo during golden hour spring rain, warm glowing windows, raindrops glistening on glass, blooming cherry blossom petals drifting across a quiet alley',
    styleId: 'anime',
    aspectRatio: '16:9',
    gradient: 'from-rose-500/35 via-pink-600/20 to-sky-900/45',
  },
  {
    id: 'insp-5',
    title: 'Siêu xe tương lai trong hầm neon',
    category: 'Cyberpunk',
    tag: 'Neon 21:9',
    prompt:
      'Sleek matte obsidian hypercar drifting through a rain-slicked futuristic neon megacity tunnel, electric cyan light trails, holographic billboards reflecting on wet carbon fiber bodywork',
    styleId: 'cyberpunk',
    aspectRatio: '21:9',
    gradient: 'from-cyan-500/35 via-blue-600/25 to-fuchsia-900/45',
  },
  {
    id: 'insp-6',
    title: 'Cáo tuyết pha lê 3D',
    category: '3D Render',
    tag: 'Octane 3D',
    prompt:
      'An adorable crystalline arctic fox sculpted from translucent frosted glass and liquid gold veins, curled up on a floating mossy stone surrounded by glowing fireflies, dark studio background',
    styleId: '3d-octane',
    aspectRatio: '1:1',
    gradient: 'from-sky-500/35 via-indigo-600/25 to-slate-900/60',
  },
  {
    id: 'insp-7',
    title: 'Biệt thự kính trên vách núi sương mù',
    category: 'Kiến trúc',
    tag: 'ArchViz',
    prompt:
      'Minimalist cantilevered glass and warm cedar villa perched on a dramatic misty mountain cliff overlooking pine forests and floating clouds at sunrise, serene infinity pool reflecting the sky',
    styleId: 'architecture',
    aspectRatio: '16:9',
    gradient: 'from-orange-500/30 via-stone-600/25 to-emerald-900/45',
  },
  {
    id: 'insp-8',
    title: 'Samurai tương lai trên nóc Neo-Saigon',
    category: 'Cyberpunk',
    tag: 'Việt Nam Sci-Fi',
    prompt:
      'Cybernetic samurai standing on a rain-drenched Neo-Saigon rooftop overlooking glowing holographic pagodas, neon Vietnamese street signs and flying vehicles at midnight',
    styleId: 'cyberpunk',
    aspectRatio: '3:4',
    gradient: 'from-fuchsia-500/35 via-violet-700/25 to-cyan-900/50',
  },
  {
    id: 'insp-9',
    title: 'Thư viện thiên văn trên mây',
    category: 'Điện ảnh',
    tag: 'Fantasy',
    prompt:
      'A breathtaking circular celestial library floating inside sunlit clouds, towering mahogany bookshelves, glowing brass astrolabes suspended in mid-air, beams of golden dust light',
    styleId: 'cinematic',
    aspectRatio: '4:3',
    gradient: 'from-amber-400/35 via-yellow-700/25 to-indigo-950/60',
  },
  {
    id: 'insp-10',
    title: 'Gấu trúc đỏ làm bánh ngân hà',
    category: '3D Render',
    tag: 'Dễ thương',
    prompt:
      'Cute tiny red panda pastry chef carefully decorating a miniature glowing galaxy cupcake in a cozy sunlit Parisian bakery, tilt-shift macro 3D render',
    styleId: '3d-octane',
    aspectRatio: '1:1',
    gradient: 'from-pink-500/35 via-orange-500/20 to-violet-900/45',
  },
  {
    id: 'insp-11',
    title: 'Cú máy bằng đồng và pha lê xanh',
    category: 'Concept Art',
    tag: 'Steampunk',
    prompt:
      'A majestic mechanical owl crafted from intricate brass clockwork gears and glowing sapphire lenses perched on an ancient stone balcony during a vivid emerald aurora night',
    styleId: 'digital-art',
    aspectRatio: '3:4',
    gradient: 'from-teal-500/35 via-emerald-700/25 to-amber-900/45',
  },
  {
    id: 'insp-12',
    title: 'Tàu hỏa xuyên đại dương mây',
    category: 'Anime',
    tag: 'Ghibli / Shinkai',
    prompt:
      'A vintage cobalt-blue train gliding across an endless shallow mirror ocean reflecting a pastel twilight sky filled with towering luminous cumulus clouds and shooting stars',
    styleId: 'anime',
    aspectRatio: '16:9',
    gradient: 'from-blue-500/35 via-cyan-500/25 to-rose-900/40',
  },
];

export const RANDOM_PROMPTS: string[] = INSPIRATION_PROMPTS.map((i) => i.prompt);
