/**
 * GitHub Contents API helper.
 *
 * Reads / writes files in the repo so the admin panel works on Vercel
 * (which has a read-only filesystem). Every write creates a commit.
 *
 * Required env vars:
 *   GITHUB_TOKEN  – a fine-grained personal access token with
 *                   Contents read+write permission on the repo
 *   GITHUB_OWNER  – repo owner  (e.g. "Ahsan-Burki2126")
 *   GITHUB_REPO   – repo name   (e.g. "behindCG-2.0")
 *   GITHUB_BRANCH – branch name (default: "Ahsan-Burki")
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "Ahsan-Burki";

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

export function isGitHubConfigured(): boolean {
  return !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
}

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// ── Read a file from the repo ────────────────────────────────────

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

/**
 * Read a file from the GitHub repo.
 * Returns { content (decoded string), sha } or null if not found.
 */
export async function ghReadFile(
  filePath: string,
): Promise<{ content: string; sha: string } | null> {
  const url = `${API_BASE}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as GitHubFileResponse;
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: decoded, sha: data.sha };
}

/**
 * Read a JSON file from the repo, returning parsed data or fallback.
 */
export async function ghReadJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const result = await ghReadFile(filePath);
    if (!result) return fallback;
    return JSON.parse(result.content) as T;
  } catch {
    return fallback;
  }
}

// ── Write a file to the repo (creates a commit) ─────────────────

/**
 * Create or update a file in the repo.
 * `sha` must be provided when updating an existing file.
 */
export async function ghWriteFile(
  filePath: string,
  content: string | Buffer,
  message: string,
): Promise<{ sha: string }> {
  // Get current SHA if file exists (needed for updates)
  const existing = await ghReadFile(filePath);

  const encoded =
    content instanceof Buffer
      ? content.toString("base64")
      : Buffer.from(content as string, "utf-8").toString("base64");

  const body: Record<string, string> = {
    message,
    content: encoded,
    branch: GITHUB_BRANCH,
  };
  if (existing) {
    body.sha = existing.sha;
  }

  const url = `${API_BASE}/contents/${filePath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return { sha: data.content.sha };
}

/**
 * Write a JSON file to the repo.
 */
export async function ghWriteJSON<T>(
  filePath: string,
  data: T,
  message?: string,
): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await ghWriteFile(
    filePath,
    json,
    message || `Update ${filePath} via admin panel`,
  );
}

// ── Delete a file from the repo ─────────────────────────────────

export async function ghDeleteFile(
  filePath: string,
  message?: string,
): Promise<boolean> {
  const existing = await ghReadFile(filePath);
  if (!existing) return false;

  const url = `${API_BASE}/contents/${filePath}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({
      message: message || `Delete ${filePath} via admin panel`,
      sha: existing.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  return res.ok;
}

// ── List files in a directory ────────────────────────────────────

interface GitHubDirEntry {
  name: string;
  path: string;
  size: number;
  type: "file" | "dir";
  sha: string;
}

export async function ghListDir(dirPath: string): Promise<GitHubDirEntry[]> {
  const url = `${API_BASE}/contents/${dirPath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return [];
    const text = await res.text();
    throw new Error(`GitHub list failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as GitHubDirEntry[];
}
