import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const PRODUCT_PROMPT =
  "professional product photography, studio lighting, clean background, commercial advertising quality, sharp focus, high resolution, premium brand feel";

// ── Step 1: Remove background via remove.bg ──────────────────────────────────
async function removeBackground(
  imageFile: File,
  apiKey: string
): Promise<Buffer | null> {
  const rbForm = new FormData();
  rbForm.append("image_file", imageFile);
  rbForm.append("size", "auto");

  const rbRes = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: rbForm,
  });

  if (!rbRes.ok) {
    console.error("remove.bg error:", rbRes.status, await rbRes.text());
    return null;
  }

  return Buffer.from(await rbRes.arrayBuffer());
}

// ── Step 2: Upload image buffer to Replicate Files API → get a CDN URL ───────
async function uploadToReplicate(
  imageBuffer: Buffer,
  mimeType: string,
  apiToken: string
): Promise<string | null> {
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
  const form = new FormData();
  form.append("content", blob, "product.png");

  const res = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiToken}` },
    body: form,
  });

  const data = await res.json();
  console.log("Replicate file upload response:", JSON.stringify(data).slice(0, 300));

  if (!res.ok) {
    console.error("Replicate file upload error:", data);
    return null;
  }

  // Replicate returns { urls: { get: "https://..." } }
  return (data?.urls?.get as string) ?? null;
}

// ── Step 3: Run prediction with image URL ─────────────────────────────────────
async function generateWithReplicate(
  imageUrl: string,
  apiToken: string
): Promise<string | null> {
  const body = {
    version:
      "965ac3a06130be7d477be7c73164fe972505fd759e7717ed28850f9865c23651",
    input: {
      prompt: PRODUCT_PROMPT,
      image: imageUrl,
      negative_prompt: "blurry, low quality, distorted, watermark, text, logo, ugly",
      num_inference_steps: 30,
      num_outputs: 1,
    },
  };

  console.log("Calling Replicate prediction with image URL:", imageUrl.slice(0, 80));

  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify(body),
  });

  const prediction = await res.json();
  console.log("Prediction response:", JSON.stringify(prediction).slice(0, 400));

  if (!res.ok) {
    console.error("Replicate prediction error:", prediction);
    return null;
  }

  if (prediction.status === "succeeded") {
    return extractOutput(prediction.output);
  }

  if (prediction.id && prediction.status !== "failed" && prediction.status !== "canceled") {
    return await pollReplicate(prediction.id, apiToken);
  }

  console.error("Prediction failed immediately:", prediction.error);
  return null;
}

function extractOutput(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) return output[0] as string;
  return null;
}

async function pollReplicate(
  predictionId: string,
  apiToken: string,
  maxAttempts = 50
): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Bearer ${apiToken}` } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    console.log(`Poll ${i + 1}: status=${data.status}`);

    if (data.status === "succeeded") return extractOutput(data.output);
    if (data.status === "failed" || data.status === "canceled") {
      console.error("Prediction failed:", data.error);
      return null;
    }
  }
  return null;
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large — max 10 MB" }, { status: 400 });
    }

    const removeBgKey = process.env.REMOVE_BG_API_KEY?.trim();
    const replicateToken = process.env.REPLICATE_API_TOKEN?.trim();

    if (!replicateToken) {
      return NextResponse.json({
        mode: "canvas",
        mock: true,
        message: "Add REPLICATE_API_TOKEN to .env.local for AI generation.",
      });
    }

    // Step 1: Remove background → get buffer
    let imageBuffer: Buffer;
    let mimeType = "image/png";

    if (removeBgKey) {
      const transparentBuffer = await removeBackground(imageFile, removeBgKey);
      if (transparentBuffer) {
        imageBuffer = transparentBuffer;
        mimeType = "image/png";
      } else {
        // Fallback to original if remove.bg fails
        imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        mimeType = imageFile.type;
      }
    } else {
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      mimeType = imageFile.type;
    }

    // Step 2: Upload to Replicate Files API → get URL
    const imageUrl = await uploadToReplicate(imageBuffer, mimeType, replicateToken);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image to Replicate" },
        { status: 500 }
      );
    }

    // Step 3: Generate AI scene
    const replicateUrl = await generateWithReplicate(imageUrl, replicateToken);

    if (replicateUrl) {
      const base64Result = await fetchImageAsBase64(replicateUrl);
      if (base64Result) {
        return NextResponse.json({
          mode: "ai",
          mock: false,
          imageData: base64Result,
        });
      }
    }

    // Fallback: return transparent PNG as base64 for client canvas compositing
    const transparentBase64 = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
    return NextResponse.json({
      mode: "canvas",
      mock: false,
      imageData: transparentBase64,
      message: "AI generation failed, using canvas fallback.",
    });
  } catch (err) {
    console.error("render-product error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
