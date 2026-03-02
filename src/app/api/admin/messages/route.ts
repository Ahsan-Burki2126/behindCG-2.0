import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getMessages, setMessages } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET — retrieve all messages (admin only)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = getMessages();
  return NextResponse.json(messages, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

// PATCH — mark messages as read or update
export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, read } = await req.json();
    const messages = getMessages();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    messages[idx].read = read;
    setMessages(messages);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

// DELETE — delete a message
export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    const messages = getMessages();
    const filtered = messages.filter((m) => m.id !== id);
    if (filtered.length === messages.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    setMessages(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
