"use client";

import { useEffect, useState, useCallback } from "react";
import { useRefreshContent } from "@/lib/ContentContext";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return <div className={`admin-toast admin-toast-${type}`}>{message}</div>;
}

interface InfoCard {
  label: string;
  value: string;
  icon: string;
  glow: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function ContactEditor() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [tab, setTab] = useState<"content" | "messages">("messages");
  const refreshContent = useRefreshContent();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const fetchMessages = useCallback(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMessages(d);
      });
  }, []);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((c) => setData(c.contact || {}));
    fetchMessages();
  }, [fetchMessages]);

  const markRead = async (id: string, read: boolean) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read } : m)),
      );
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast("Message deleted");
    } else {
      showToast("Failed to delete", "error");
    }
  };

  const save = async () => {
    const allContent = await fetch("/api/admin/content").then((r) => r.json());
    allContent.contact = data;
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allContent),
    });
    if (res.ok) {
      showToast("Contact section saved!");
      refreshContent();
    } else showToast("Save failed", "error");
  };

  if (!data) return <div className="text-white/30">Loading...</div>;

  const contact = data;
  const infoCards = (contact.infoCards as InfoCard[]) || [];

  const update = (key: string, value: unknown) =>
    setData({ ...contact, [key]: value });

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contact Section</h1>
            <p className="text-sm text-white/30">
              Manage messages and edit contact page content
            </p>
          </div>
          <div className="flex gap-2">
            {tab === "content" && (
              <button onClick={save} className="admin-btn admin-btn-primary">
                Save Changes
              </button>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mt-3">
          <button
            onClick={() => setTab("messages")}
            className={`text-sm font-mono pb-1 border-b-2 transition-colors ${tab === "messages" ? "border-accent text-accent" : "border-transparent text-white/40 hover:text-white/60"}`}
          >
            Messages{" "}
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("content")}
            className={`text-sm font-mono pb-1 border-b-2 transition-colors ${tab === "content" ? "border-accent text-accent" : "border-transparent text-white/40 hover:text-white/60"}`}
          >
            Page Content
          </button>
        </div>
      </div>

      {tab === "messages" ? (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="admin-card text-center py-12">
              <p className="text-white/30 text-lg">No messages yet</p>
              <p className="text-white/20 text-sm mt-1">
                Messages from your contact form will appear here
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`admin-card relative ${!msg.read ? "border-l-2 border-l-accent" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-white">
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent/20 text-accent font-mono">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mb-1">
                      <a
                        href={`mailto:${msg.email}`}
                        className="hover:text-accent transition-colors"
                      >
                        {msg.email}
                      </a>
                    </p>
                    <div className="flex gap-3 text-xs text-white/30 mb-3">
                      {msg.projectType && <span>📋 {msg.projectType}</span>}
                      {msg.budget && <span>💰 {msg.budget}</span>}
                      <span>
                        🕐{" "}
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => markRead(msg.id, !msg.read)}
                      className="admin-btn admin-btn-secondary text-xs"
                      title={msg.read ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.read ? "📩" : "✅"}
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="admin-btn admin-btn-danger text-xs"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Page Header
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline</label>
                <input
                  className="admin-input"
                  value={(contact.tagline as string) || ""}
                  onChange={(e) => update("tagline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Headline</label>
                <input
                  className="admin-input"
                  value={(contact.headline as string) || ""}
                  onChange={(e) => update("headline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Subheadline</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={(contact.subheadline as string) || ""}
                  onChange={(e) => update("subheadline", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Success Message (after form submit)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  value={(contact.successTitle as string) || ""}
                  onChange={(e) => update("successTitle", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Message</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={(contact.successMessage as string) || ""}
                  onChange={(e) => update("successMessage", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Info Cards
            </h3>
            <div className="space-y-4">
              {infoCards.map((card, i) => (
                <div key={i} className="p-4 border border-white/5 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="admin-label">Label</label>
                      <input
                        className="admin-input"
                        value={card.label}
                        onChange={(e) => {
                          const c = [...infoCards];
                          c[i] = { ...card, label: e.target.value };
                          update("infoCards", c);
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Value</label>
                      <input
                        className="admin-input"
                        value={card.value}
                        onChange={(e) => {
                          const c = [...infoCards];
                          c[i] = { ...card, value: e.target.value };
                          update("infoCards", c);
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Icon (emoji)</label>
                      <input
                        className="admin-input"
                        value={card.icon}
                        onChange={(e) => {
                          const c = [...infoCards];
                          c[i] = { ...card, icon: e.target.value };
                          update("infoCards", c);
                        }}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <select
                        className="admin-input flex-1"
                        value={card.glow}
                        onChange={(e) => {
                          const c = [...infoCards];
                          c[i] = { ...card, glow: e.target.value };
                          update("infoCards", c);
                        }}
                      >
                        <option value="teal">Teal</option>
                        <option value="orange">Orange</option>
                      </select>
                      <button
                        onClick={() =>
                          update(
                            "infoCards",
                            infoCards.filter((_, idx) => idx !== i),
                          )
                        }
                        className="admin-btn admin-btn-danger"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  update("infoCards", [
                    ...infoCards,
                    { label: "", value: "", icon: "📌", glow: "teal" },
                  ])
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Info Card
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
