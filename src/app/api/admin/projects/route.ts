import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getProjects, setProjects, type Project } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = getProjects();
  return NextResponse.json(projects, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const project: Project = await req.json();
    const projects = getProjects();
    project.id =
      projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
    projects.push(project);
    setProjects(projects);
    return NextResponse.json({ success: true, id: project.id });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const project: Project = await req.json();
    const projects = getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    projects[idx] = project;
    setProjects(projects);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    let id: number;

    if (idParam) {
      id = parseInt(idParam);
    } else {
      const body = await req.json();
      id = body.id;
    }

    const projects = getProjects().filter((p) => p.id !== id);
    setProjects(projects);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
