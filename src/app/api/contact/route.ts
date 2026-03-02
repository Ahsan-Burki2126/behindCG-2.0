import { NextResponse } from "next/server";
import { addMessage } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, projectType, budget, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    // Simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    const saved = await addMessage({
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      projectType: String(projectType || "").slice(0, 100),
      budget: String(budget || "").slice(0, 50),
      message: String(message).slice(0, 5000),
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }
}
