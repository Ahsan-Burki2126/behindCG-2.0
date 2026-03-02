import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Generic JSON read/write ──────────────────────────────────────

export function readJSON<T>(filename: string, fallback: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Typed helpers ────────────────────────────────────────────────

export type SiteContent = Record<string, unknown>;

export interface ViewerSettings {
  cameraPosition: [number, number, number];
  cameraFov: number;
  modelScale: number;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
  autoRotate: boolean;
  autoRotateSpeed: number;
  environmentPreset: string;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  bgColor: string;
  showShadows: boolean;
  showFloat: boolean;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  slug: string;
  year?: string;
  client?: string;
  longDescription?: string;
  tools?: string[];
  breakdown?: string[];
  image?: string;
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettings>;
  model: {
    variant: string;
    color: string;
    wireColor: string;
    distort?: boolean;
    wobble?: boolean;
  };
}

export interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  format: string;
  polycount: string;
  description?: string;
  image?: string;
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettings>;
  model: {
    variant: string;
    color: string;
    wireColor: string;
    distort?: boolean;
    wobble?: boolean;
  };
  specs?: [string, string][];
}

export function getContent(): SiteContent {
  return readJSON<SiteContent>("content.json", {});
}

export function setContent(data: SiteContent): void {
  writeJSON("content.json", data);
}

export function getProjects(): Project[] {
  return readJSON<Project[]>("projects.json", []);
}

export function setProjects(data: Project[]): void {
  writeJSON("projects.json", data);
}

export function getProducts(): Product[] {
  return readJSON<Product[]>("products.json", []);
}

export function setProducts(data: Product[]): void {
  writeJSON("products.json", data);
}
