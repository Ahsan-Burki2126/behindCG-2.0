import fs from "fs";
import path from "path";
import { isGitHubConfigured, ghReadJSON, ghWriteJSON } from "@/lib/github";

const DATA_DIR = path.join(process.cwd(), "data");
const isProduction = process.env.NODE_ENV === "production";

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

/**
 * Async write that uses GitHub API in production, local fs otherwise.
 */
export async function writeJSONAsync<T>(
  filename: string,
  data: T,
): Promise<void> {
  if (isProduction && isGitHubConfigured()) {
    await ghWriteJSON(`data/${filename}`, data);
  } else {
    writeJSON(filename, data);
  }
}

/**
 * Async read that uses GitHub API in production, local fs otherwise.
 */
export async function readJSONAsync<T>(
  filename: string,
  fallback: T,
): Promise<T> {
  if (isProduction && isGitHubConfigured()) {
    return ghReadJSON(`data/${filename}`, fallback);
  }
  return readJSON(filename, fallback);
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

export async function getContentAsync(): Promise<SiteContent> {
  return readJSONAsync<SiteContent>("content.json", {});
}

export function setContent(data: SiteContent): void {
  writeJSON("content.json", data);
}

export async function setContentAsync(data: SiteContent): Promise<void> {
  await writeJSONAsync("content.json", data);
}

export function getProjects(): Project[] {
  return readJSON<Project[]>("projects.json", []);
}

export async function getProjectsAsync(): Promise<Project[]> {
  return readJSONAsync<Project[]>("projects.json", []);
}

export function setProjects(data: Project[]): void {
  writeJSON("projects.json", data);
}

export async function setProjectsAsync(data: Project[]): Promise<void> {
  await writeJSONAsync("projects.json", data);
}

export function getProducts(): Product[] {
  return readJSON<Product[]>("products.json", []);
}

export async function getProductsAsync(): Promise<Product[]> {
  return readJSONAsync<Product[]>("products.json", []);
}

export function setProducts(data: Product[]): void {
  writeJSON("products.json", data);
}

export async function setProductsAsync(data: Product[]): Promise<void> {
  await writeJSONAsync("products.json", data);
}

// ── Contact Messages ─────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function getMessages(): ContactMessage[] {
  return readJSON<ContactMessage[]>("messages.json", []);
}

export async function getMessagesAsync(): Promise<ContactMessage[]> {
  return readJSONAsync<ContactMessage[]>("messages.json", []);
}

export function setMessages(data: ContactMessage[]): void {
  writeJSON("messages.json", data);
}

export async function setMessagesAsync(data: ContactMessage[]): Promise<void> {
  await writeJSONAsync("messages.json", data);
}

export async function addMessage(
  msg: Omit<ContactMessage, "id" | "createdAt" | "read">,
): Promise<ContactMessage> {
  const messages = await readJSONAsync<ContactMessage[]>("messages.json", []);
  const newMsg: ContactMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    read: false,
  };
  messages.unshift(newMsg);
  await writeJSONAsync("messages.json", messages);
  return newMsg;
}
