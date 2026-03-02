import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";
import {
  isGitHubConfigured,
  ghWriteFile,
  ghListDir,
  ghDeleteFile,
} from "@/lib/github";

export const dynamic = "force-dynamic";
const isProduction = process.env.NODE_ENV === "production";

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

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const publicPath = `/${folder}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    if (isProduction && isGitHubConfigured()) {
      // Write to GitHub repo
      await ghWriteFile(
        `public/${folder}/${filename}`,
        buffer,
        `Upload ${filename} via admin panel`,
      );
    } else {
      // Write to local filesystem
      const uploadDir = path.join(process.cwd(), "public", folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
    }

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

  if (isProduction && isGitHubConfigured()) {
    try {
      const entries = await ghListDir(`public/${folder}`);
      const files = entries
        .filter((e) => e.type === "file")
        .map((e) => ({
          name: e.name,
          path: `/${folder}/${e.name}`,
          size: e.size,
          modified: "",
        }));
      return NextResponse.json({ files });
    } catch {
      return NextResponse.json({ files: [] });
    }
  }

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

    if (isProduction && isGitHubConfigured()) {
      const ghPath = `public${relativePath}`;
      const deleted = await ghDeleteFile(
        ghPath,
        `Delete ${relativePath} via admin panel`,
      );
      if (!deleted) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

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
