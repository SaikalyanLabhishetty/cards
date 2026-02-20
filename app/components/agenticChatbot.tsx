"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  PORTFOLIO_LINKS,
  PORTFOLIO_SECTIONS,
  type PortfolioLinkTarget,
  type PortfolioSectionTarget,
} from "@/app/lib/portfolioAgent";

type UiRole = "assistant" | "user" | "action" | "error";

type UiMessage = {
  id: string;
  role: UiRole;
  content: string;
};

type ChatRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

type ToolCall = {
  name: string;
  args: Record<string, unknown>;
};

type ChatApiResponse = {
  text?: string;
  toolCalls?: ToolCall[];
  error?: string;
};

const sectionAliases: Record<string, PortfolioSectionTarget> = {
  top: "top",
  home: "top",
  about: "about",
  experience: "experience",
  projects: "projects",
  connect: "connect",
  contact: "connect",
};

const linkLabels: Record<PortfolioLinkTarget, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  resume: "resume",
  home: "portfolio home",
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readString(args: Record<string, unknown>, key: string) {
  const value = args[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(args: Record<string, unknown>, key: string) {
  const value = args[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatCalendarStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function normalizeSection(value: string): PortfolioSectionTarget | null {
  const normalized = value.toLowerCase();
  return normalized in sectionAliases ? sectionAliases[normalized] : null;
}

function buildStartDate(date: string, time: string) {
  if (!date) return null;

  const normalizedTime = /^\d{2}:\d{2}$/.test(time) ? time : "10:00";
  const parsed = new Date(`${date}T${normalizedTime}:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export default function AgenticChatbot() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content:
        "Hi, I am Kalyan's AI assistant. Ask about projects, experience, links, scheduling, or contact.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  const conversationForApi = useMemo(() => {
    return messages
      .filter((message) => message.role === "assistant" || message.role === "user")
      .map<ChatRequestMessage>((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      }));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const pushMessage = (role: UiRole, content: string) => {
    setMessages((previous) => [...previous, { id: makeId(), role, content }]);
  };

  const scrollToSection = (section: PortfolioSectionTarget) => {
    const element = document.getElementById(PORTFOLIO_SECTIONS[section]);
    if (!element) return false;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  const runToolCall = (toolCall: ToolCall) => {
    switch (toolCall.name) {
      case "open_link": {
        const requestedTarget = readString(toolCall.args, "target").toLowerCase();
        if (!requestedTarget || !(requestedTarget in PORTFOLIO_LINKS)) {
          return "Could not open that link target.";
        }

        const target = requestedTarget as PortfolioLinkTarget;
        const url = PORTFOLIO_LINKS[target];
        window.open(url, "_blank", "noopener,noreferrer");
        return `Opened ${linkLabels[target]}.`;
      }

      case "redirect_to_section": {
        const requestedSection = readString(toolCall.args, "section");
        const section = normalizeSection(requestedSection);

        if (!section) {
          return "Could not find that section.";
        }

        const ok = scrollToSection(section);
        return ok ? `Moved to the ${section} section.` : `Section ${section} is not available on this page.`;
      }

      case "schedule_meeting": {
        const title = readString(toolCall.args, "title") || "Portfolio Meeting";
        const details =
          readString(toolCall.args, "details") ||
          "Meeting requested through Sai Kalyan Labhishetty's portfolio assistant.";
        const timezone = readString(toolCall.args, "timezone");
        const date = readString(toolCall.args, "date");
        const time = readString(toolCall.args, "time");

        const start = buildStartDate(date, time);
        const durationCandidate = readNumber(toolCall.args, "durationMinutes");
        const durationMinutes = durationCandidate ? Math.max(15, Math.min(180, Math.round(durationCandidate))) : 30;

        const params = new URLSearchParams({
          action: "TEMPLATE",
          text: title,
          details,
        });

        if (start) {
          const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
          params.set("dates", `${formatCalendarStamp(start)}/${formatCalendarStamp(end)}`);
        }

        if (timezone) {
          params.set("ctz", timezone);
        }

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");

        if (start) {
          return `Opened a calendar draft for ${start.toLocaleString()}.`;
        }

        return "Opened a calendar draft. Add date and time to finalize scheduling.";
      }

      case "send_message": {
        const email = readString(toolCall.args, "email");
        const subject = readString(toolCall.args, "subject");
        const message = readString(toolCall.args, "message");

        if (!message) {
          return "Could not prepare a message because the content was empty.";
        }

        scrollToSection("connect");
        window.dispatchEvent(
          new CustomEvent("portfolio:open-contact", {
            detail: {
              email,
              subject,
              message,
            },
          }),
        );

        return "Prepared your message in the contact panel.";
      }

      default:
        return `Tool ${toolCall.name} is not supported by the client.`;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();
    if (!question || sending) return;

    const nextConversation = [...conversationForApi, { role: "user", content: question }];

    setInput("");
    pushMessage("user", question);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextConversation }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        pushMessage("error", data.error || "Chat request failed.");
        return;
      }

      if (data.text) {
        pushMessage("assistant", data.text);
      }

      if (Array.isArray(data.toolCalls) && data.toolCalls.length > 0) {
        data.toolCalls.forEach((toolCall) => {
          const status = runToolCall(toolCall);
          pushMessage("action", status);
        });
      }

      if (!data.text && (!data.toolCalls || data.toolCalls.length === 0)) {
        pushMessage("assistant", "I did not get enough context to respond. Try rephrasing your request.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected chat error.";
      pushMessage("error", message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[min(92vw,380px)] text-white">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-full border border-cyan-400/40 bg-[#04050d]/90 px-4 py-2 text-sm font-semibold shadow-[0_0_22px_rgba(6,182,212,0.35)] hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.55)]"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          AI Assistant
        </button>
      )}

      {open && (
        <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#05070f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Agentic Bot</p>
              <p className="text-sm text-gray-200">Portfolio Actions + Answers</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-white/20 px-2 py-1 text-xs text-gray-200 hover:border-white/40"
              aria-label="Close AI assistant"
            >
              Close
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 py-2"
                    : message.role === "action"
                      ? "rounded-xl border border-purple-500/35 bg-purple-500/10 px-3 py-2 text-purple-100"
                      : message.role === "error"
                        ? "rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200"
                        : "mr-8 rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                }
              >
                {message.content}
              </div>
            ))}
            {sending && <div className="text-xs uppercase tracking-[0.16em] text-cyan-300">Thinking...</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-cyan-500/20 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask something or request an action"
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg border border-cyan-400/50 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
