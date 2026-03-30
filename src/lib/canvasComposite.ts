import type { Template } from "./aiTemplates";

/**
 * Composites a product image onto a template background using the browser Canvas API.
 * Handles both transparent PNGs (from remove.bg) and regular images.
 * Returns a base64 PNG data URL.
 */
export function compositeProductOnTemplate(
  productSrc: string,
  template: Template,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const SIZE = 1200;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bgGrad.addColorStop(0, template.bg[0]);
    bgGrad.addColorStop(0.55, template.bg[1]);
    bgGrad.addColorStop(1, template.bg[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 2. Radial light burst from configured position
    const lx = template.lightPos.x * SIZE;
    const ly = template.lightPos.y * SIZE;
    const lr = template.lightSize * SIZE;
    const lightGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    lightGrad.addColorStop(0, template.lightColor);
    lightGrad.addColorStop(0.45, template.lightColor.replace(/[\d.]+\)$/, "0.05)"));
    lightGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 3. Vignette
    if (template.vignette) {
      const vigGrad = ctx.createRadialGradient(
        SIZE / 2, SIZE * 0.42, SIZE * 0.22,
        SIZE / 2, SIZE * 0.42, SIZE * 0.88,
      );
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(0.55, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, template.vignette);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const PAD = SIZE * 0.14;
      const maxW = SIZE - PAD * 2;
      const maxH = SIZE - PAD * 2;
      const ratio = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const ix = (SIZE - w) / 2;
      const iy = (SIZE - h) / 2;
      const groundY = iy + h;

      // 4. Ground shadow ellipse beneath product
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(
        SIZE / 2, groundY + 14, 0,
        SIZE / 2, groundY + 14, w * 0.46,
      );
      shadowGrad.addColorStop(0, template.shadow);
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(SIZE / 2, groundY + 10, w * 0.43, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Product with drop shadow
      ctx.save();
      ctx.shadowColor = template.shadow;
      ctx.shadowBlur = SIZE * 0.055;
      ctx.shadowOffsetY = SIZE * 0.02;
      ctx.drawImage(img, ix, iy, w, h);
      ctx.restore();

      // 6. Ground reflection (subtle, faded)
      ctx.save();
      ctx.translate(ix, groundY);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.09;
      ctx.drawImage(img, 0, -h, w, h);
      ctx.restore();

      // Fade out the reflection with a gradient
      const reflFade = ctx.createLinearGradient(0, groundY, 0, groundY + h * 0.3);
      reflFade.addColorStop(0, "rgba(0,0,0,0)");
      reflFade.addColorStop(1, template.bg[1]);
      ctx.fillStyle = reflFade;
      ctx.fillRect(ix, groundY, w, h * 0.3);

      resolve(canvas.toDataURL("image/png", 0.95));
    };

    img.onerror = () => reject(new Error("Failed to load product image"));
    img.src = productSrc;
  });
}
