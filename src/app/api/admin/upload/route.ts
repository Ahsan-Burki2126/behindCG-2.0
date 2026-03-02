import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file types
    const allowedExtensions = [
      ".glb",
      ".gltf",
      ".fbx",
      ".blend",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".avif",
      ".svg",
      ".mp4",
      ".webm",
      ".hdr",
      ".exr",
    ];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `File type ${ext} not allowed` },
        { status: 400 },
      );
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 100MB)" },
        { status: 400 },
      );
    }

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/${folder}/${filename}`;
    return NextResponse.json({ success: true, path: publicPath, filename });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || "uploads";
  const dir = path.join(process.cwd(), "public", folder);

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ files: [] });
  }

  const files = fs.readdirSync(dir).map((name) => {
    const stat = fs.statSync(path.join(dir, name));
    return {
      name,
      path: `/${folder}/${name}`,
      size: stat.size,
      modified: stat.mtime.toISOString(),
    };
  });

  return NextResponse.json({ files });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filePath: relativePath } = await req.json();
    const fullPath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(fullPath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
