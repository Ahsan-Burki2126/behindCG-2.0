import { NextRequest, NextResponse } from "next/server";

// Required env var: REMOVE_BG_API_KEY
// Get a free API key at https://www.remove.bg/dashboard#api-key
// Add to .env.local: REMOVE_BG_API_KEY=your_key_here

export const runtime = "nodejs";
export const maxDuration = 30;

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
      return NextResponse.json(
        { error: "File too large — max 10 MB" },
        { status: 400 },
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    // Demo mode — no API key configured
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mock: true,
        message:
          "Set REMOVE_BG_API_KEY in .env.local for real background removal.",
      });
    }

    // Call remove.bg
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
      // Graceful fallback to mock mode
      return NextResponse.json({
        success: true,
        mock: true,
        message: "Background removal service unavailable, using original image.",
      });
    }

    const buffer = await rbRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return NextResponse.json({
      success: true,
      mock: false,
      imageData: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    console.error("product-enhance error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
