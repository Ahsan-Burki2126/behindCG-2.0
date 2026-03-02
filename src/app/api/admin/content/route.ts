import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getContentAsync, setContentAsync } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContentAsync();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();
    await setContentAsync(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const updates = await req.json();
    const current = await getContentAsync();
    const merged = { ...current, ...updates };
    await setContentAsync(merged);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
