"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid password");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4"
      style={{ cursor: "auto" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#f0f0f5] tracking-tight mb-2">
            BehindCG<span className="text-[#f97316]">.</span>
          </h1>
          <p className="text-sm text-white/30">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="admin-card">
          <form onSubmit={handleLogin}>
            <label className="admin-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input mb-4"
              placeholder="Enter admin password"
              autoFocus
              required
            />
            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/15 mt-6">
          Secure admin access
        </p>
      </div>
    </div>
  );
}
