export type LogoRemovalMode = 'inpaint' | 'crop';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không thể tải ảnh để xử lý xóa logo'));
    img.src = src;
  });
}

/**
 * Removes bottom-right corner watermark/logo using either:
 * - 'inpaint': Inverse-distance weighted mirrored boundary patch synthesis
 *   (preserves 100% composition and seamlessly blends textures & gradients)
 * - 'crop': Aspect-ratio-preserving bottom trim (100% razor sharp, zero artifacts)
 */
export async function removeCornerLogo(
  imageUrl: string,
  mode: LogoRemovalMode = 'inpaint'
): Promise<string> {
  const img = await loadImage(imageUrl);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  if (!w || !h || w < 120 || h < 120) {
    return imageUrl;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return imageUrl;

  if (mode === 'crop') {
    // Trim bottom 8.5% and proportional left/right margins to preserve exact aspect ratio
    const trimRatio = 0.085;
    const cropH = Math.round(h * (1 - trimRatio));
    const cropW = Math.round(w * (1 - trimRatio));
    const sx = Math.round((w - cropW) / 2);
    const sy = 0;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, w, h);
    return canvas.toDataURL('image/png');
  }

  // Mode: 'inpaint' — seamless boundary-weighted mirrored texture synthesis
  ctx.drawImage(img, 0, 0, w, h);

  // Adaptive bottom-right corner box covering typical AI watermark badges (e.g. pollinations.ai)
  const boxW = Math.min(Math.round(w * 0.28), Math.max(220, Math.round(w * 0.24)));
  const boxH = Math.min(Math.round(h * 0.1), Math.max(64, Math.round(h * 0.075)));

  const x0 = Math.max(16, w - boxW);
  const y0 = Math.max(16, h - boxH);
  const regionW = w - x0;
  const regionH = h - y0;

  // Read full image pixel buffer once for fast synthesis
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;

  const featherTop = Math.min(12, Math.floor(regionH * 0.2));
  const featherLeft = Math.min(16, Math.floor(regionW * 0.12));

  // Sample pool dimensions safely inside valid image bounds
  const maxAbove = Math.max(8, Math.min(y0 - 1, Math.round(regionH * 1.35)));
  const maxLeft = Math.max(8, Math.min(x0 - 1, Math.round(regionW * 0.65)));

  // Pre-compute slight organic blur/smoothing for deep interior to eliminate repeating seams
  for (let dy = 0; dy < regionH; dy++) {
    const y = y0 + dy;
    const v = (dy + 1) / regionH; // 0..1 top to bottom

    // Mirrored vertical offset above the box
    const mirroredDy = Math.min(maxAbove, dy + 2);
    const srcTopY = Math.max(0, y0 - mirroredDy);

    for (let dx = 0; dx < regionW; dx++) {
      const x = x0 + dx;
      const u = (dx + 1) / regionW; // 0..1 left to right

      // Mirrored horizontal offset left of the box
      const mirroredDx = Math.min(maxLeft, dx + 2);
      const srcLeftX = Math.max(0, x0 - mirroredDx);

      // Inverse-distance squared weights favor the closest clean border
      const wTop = 1 / Math.pow(v + 0.04, 2.2);
      const wLeft = 1 / Math.pow(u + 0.04, 2.2);
      const wSum = wTop + wLeft;

      // Also gently blend a shifted diagonal sample deep inside the corner to keep texture natural
      const topIdx = (srcTopY * w + x) * 4;
      const leftIdx = (y * w + srcLeftX) * 4;
      const diagX = Math.max(0, x0 - Math.min(maxLeft, Math.round(dx * 0.55) + 2));
      const diagY = Math.max(0, y0 - Math.min(maxAbove, Math.round(dy * 0.55) + 2));
      const diagIdx = (diagY * w + diagX) * 4;

      // Interior diagonal contribution rises gently toward the far bottom-right corner
      const diagWeight = 0.22 * u * v;
      const borderScale = 1 - diagWeight;

      const rSynth =
        borderScale * ((src[topIdx] * wTop + src[leftIdx] * wLeft) / wSum) +
        diagWeight * src[diagIdx];
      const gSynth =
        borderScale * ((src[topIdx + 1] * wTop + src[leftIdx + 1] * wLeft) / wSum) +
        diagWeight * src[diagIdx + 1];
      const bSynth =
        borderScale * ((src[topIdx + 2] * wTop + src[leftIdx + 2] * wLeft) / wSum) +
        diagWeight * src[diagIdx + 2];

      // Smooth feathering along top & left boundary edges
      const alphaTop = dy < featherTop ? (dy + 1) / (featherTop + 1) : 1;
      const alphaLeft = dx < featherLeft ? (dx + 1) / (featherLeft + 1) : 1;
      const alpha = Math.min(alphaTop, alphaLeft);

      const dstIdx = (y * w + x) * 4;
      dst[dstIdx] = Math.round(src[dstIdx] * (1 - alpha) + rSynth * alpha);
      dst[dstIdx + 1] = Math.round(src[dstIdx + 1] * (1 - alpha) + gSynth * alpha);
      dst[dstIdx + 2] = Math.round(src[dstIdx + 2] * (1 - alpha) + bSynth * alpha);
      dst[dstIdx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Subtle soft pass right along the seam lines to make the transition completely invisible
  ctx.save();
  ctx.filter = 'blur(1.2px)';
  ctx.globalAlpha = 0.35;
  ctx.drawImage(
    canvas,
    x0 - 2,
    y0 - 2,
    regionW + 2,
    regionH + 2,
    x0 - 2,
    y0 - 2,
    regionW + 2,
    regionH + 2
  );
  ctx.restore();

  return canvas.toDataURL('image/png');
}
