"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  VUEVERSE_LINKS,
  VUEVERSE_SITE_NAME,
  type VueverseLinkTarget,
} from "@/app/lib/vueverseBot";

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

type SendMailApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

type ContactStep = "idle" | "name" | "email" | "description";

type ContactDraft = {
  name: string;
  email: string;
  description: string;
};

type VueverseChatbotProps = {
  embedded?: boolean;
  onRequestClose?: () => void;
};

const linkLabels: Record<VueverseLinkTarget, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  home: "website home",
  calendly: "Calendly",
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

function isVueverseLinkTarget(value: string): value is VueverseLinkTarget {
  return Object.prototype.hasOwnProperty.call(VUEVERSE_LINKS, value);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function detectContactIntent(userQuestion: string) {
  const text = userQuestion.toLowerCase();
  return /(hire|hiring|quote|proposal|contact|consult|consulting|project|build|work together|collaborat|pricing|send (a )?(mail|email|message)|email|mail)/.test(
    text,
  );
}

function detectCancelFlowIntent(userQuestion: string) {
  const text = userQuestion.toLowerCase();
  return /(cancel|stop|skip|exit|not now|later|back|never mind)/.test(text);
}

function detectScheduleIntent(userQuestion: string) {
  const text = userQuestion.toLowerCase();
  return /(schedule|meeting|book|call|appointment|calendly)/.test(text);
}

function detectKnowledgeIntent(userQuestion: string) {
  const text = userQuestion.toLowerCase();
  const looksLikeQuestion =
    text.includes("?") ||
    /^(what|who|how|why|when|where|tell me|explain|share|can you)/.test(text);
  const knowledgeTopic =
    /(service|services|offer|offering|project|projects|experience|skills|stack|github|company|process|background)/.test(
      text,
    );
  return looksLikeQuestion && knowledgeTopic;
}

function hasActionIntent(userQuestion: string, toolCall: ToolCall) {
  const text = userQuestion.toLowerCase();
  const toolName = toolCall.name;

  if (toolName === "send_message" || toolName === "schedule_meeting") {
    return true;
  }

  if (toolName === "open_link") {
    const target = readString(toolCall.args, "target").toLowerCase();
    const genericLinkIntent = /(open|show|visit|go to|link|share|where)/.test(text);

    if (genericLinkIntent) {
      return true;
    }

    if (target === "linkedin") {
      return /(linkedin|linked in)/.test(text);
    }

    if (target === "github") {
      return /(github|git hub|repo|repositories|code)/.test(text);
    }

    if (target === "calendly") {
      return /(calendly|schedule|meeting|book)/.test(text);
    }

    return false;
  }

  return true;
}

export default function VueverseChatbot({
  embedded = false,
  onRequestClose,
}: VueverseChatbotProps) {
  const [open, setOpen] = useState(embedded);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [contactStep, setContactStep] = useState<ContactStep>("idle");
  const [contactDraft, setContactDraft] = useState<ContactDraft>({
    name: "",
    email: "",
    description: "",
  });
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    {
      id: makeId(),
      role: "assistant",
      content: `Hi, I am ${VUEVERSE_SITE_NAME}'s AI assistant. Ask me about services, process, or contact.`,
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

  const startContactFlow = () => {
    setContactDraft({ name: "", email: "", description: "" });
    setContactStep("name");
    pushMessage(
      "assistant",
      `Great, I can help you contact ${VUEVERSE_SITE_NAME}. First, what is your name?`,
    );
  };

  const executeToolCall = async (toolCall: ToolCall): Promise<string> => {
    switch (toolCall.name) {
      case "open_link": {
        const requestedTarget = readString(toolCall.args, "target").toLowerCase();
        if (!requestedTarget || !isVueverseLinkTarget(requestedTarget)) {
          return "Could not open that link target.";
        }

        const target = requestedTarget as VueverseLinkTarget;
        const url = VUEVERSE_LINKS[target];

        if (!url) {
          return `The ${linkLabels[target]} link is not configured yet.`;
        }

        window.open(url, "_blank", "noopener,noreferrer");
        return `Opened ${linkLabels[target]}.`;
      }

      case "schedule_meeting": {
        const calendlyUrl = VUEVERSE_LINKS.calendly;
        if (!calendlyUrl) {
          return "Calendly is not configured. Add NEXT_PUBLIC_VUEVERSE_CALENDLY_URL.";
        }

        const name = readString(toolCall.args, "name");
        const email = readString(toolCall.args, "email");

        let url: URL;
        try {
          url = new URL(calendlyUrl, window.location.origin);
        } catch {
          return "Calendly URL is invalid. Check NEXT_PUBLIC_VUEVERSE_CALENDLY_URL.";
        }

        if (name) {
          url.searchParams.set("name", name);
        }

        if (email) {
          url.searchParams.set("email", email);
        }

        window.open(url.toString(), "_blank", "noopener,noreferrer");
        return "Opened Calendly scheduling page.";
      }

      case "send_message": {
        const name = readString(toolCall.args, "name");
        const email = readString(toolCall.args, "email");
        const subject = readString(toolCall.args, "subject");
        const message = readString(toolCall.args, "message");

        if (!email || !message) {
          return "Cannot send message yet. Please provide both your email and message.";
        }

        const response = await fetch("/api/vueverse/contact/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
          }),
        });

        let data: SendMailApiResponse = {};
        try {
          data = (await response.json()) as SendMailApiResponse;
        } catch {
          data = {};
        }

        if (!response.ok) {
          return data.error || "Sending message failed.";
        }

        return data.message || "Message sent successfully.";
      }

      default:
        return `Tool ${toolCall.name} is not supported by the client.`;
    }
  };

  const sendToAgent = async (question: string) => {
    const nextConversation = [...conversationForApi, { role: "user", content: question }];
    setSending(true);

    try {
      const response = await fetch("/api/vueverse/chat", {
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
        for (const toolCall of data.toolCalls) {
          if (!hasActionIntent(question, toolCall)) {
            pushMessage(
              "action",
              `Skipped ${toolCall.name}: no explicit action intent detected.`,
            );
            continue;
          }

          const status = await executeToolCall(toolCall);
          pushMessage("action", status);
        }
      }

      if (!data.text && (!data.toolCalls || data.toolCalls.length === 0)) {
        pushMessage(
          "assistant",
          "I did not get enough context to respond. Try rephrasing your request.",
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected chat error.";
      pushMessage("error", message);
    } finally {
      setSending(false);
    }
  };

  const handleContactStepInput = async (userInput: string) => {
    if (contactStep === "name") {
      setContactDraft((previous) => ({ ...previous, name: userInput }));
      setContactStep("email");
      pushMessage("assistant", "Thanks. Please share your email address.");
      return;
    }

    if (contactStep === "email") {
      if (!isValidEmail(userInput)) {
        pushMessage(
          "assistant",
          "Please enter a valid email address, or type `cancel` to stop contact setup.",
        );
        return;
      }

      setContactDraft((previous) => ({ ...previous, email: userInput }));
      setContactStep("description");
      pushMessage("assistant", "Got it. Briefly describe your requirement.");
      return;
    }

    if (contactStep === "description") {
      const finalDraft = {
        ...contactDraft,
        description: userInput,
      };

      setContactDraft(finalDraft);
      setContactStep("idle");
      setSending(true);

      const status = await executeToolCall({
        name: "send_message",
        args: {
          name: finalDraft.name,
          email: finalDraft.email,
          subject: `Website inquiry from ${finalDraft.name || finalDraft.email}`,
          message: finalDraft.description,
        },
      });

      pushMessage("action", status);
      pushMessage(
        "assistant",
        "If useful, tap `Schedule a Meeting` to book directly.",
      );
      setSending(false);
    }
  };

  const runQuickAction = async (
    action: "schedule" | "contact" | "overview",
  ) => {
    if (sending) return;

    if (action === "schedule") {
      pushMessage("user", "Schedule a meeting");
      setSending(true);
      const status = await executeToolCall({
        name: "schedule_meeting",
        args: {
          name: contactDraft.name,
          email: contactDraft.email,
        },
      });
      pushMessage("action", status);
      setSending(false);
      return;
    }

    if (action === "contact") {
      pushMessage("user", `I want to contact ${VUEVERSE_SITE_NAME}`);
      startContactFlow();
      return;
    }

    const overviewPrompt = `Tell me about ${VUEVERSE_SITE_NAME}'s services, process, and technical strengths.`;
    pushMessage("user", `Learn about ${VUEVERSE_SITE_NAME}`);
    await sendToAgent(overviewPrompt);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();
    if (!question || sending) return;

    setInput("");
    pushMessage("user", question);

    if (contactStep !== "idle") {
      if (detectCancelFlowIntent(question)) {
        setContactStep("idle");
        pushMessage("assistant", "No problem. I cancelled contact setup. Ask me anything.");
        return;
      }

      if (detectKnowledgeIntent(question)) {
        setContactStep("idle");
        pushMessage("assistant", "Sure, I paused contact setup. Here are details on that:");
        await sendToAgent(question);
        return;
      }

      if (detectScheduleIntent(question)) {
        setContactStep("idle");
        setSending(true);
        const status = await executeToolCall({
          name: "schedule_meeting",
          args: {
            name: contactDraft.name,
            email: contactDraft.email,
          },
        });
        pushMessage("action", status);
        setSending(false);
        return;
      }

      await handleContactStepInput(question);
      return;
    }

    if (detectContactIntent(question)) {
      startContactFlow();
      return;
    }

    await sendToAgent(question);
  };

  const handleClose = () => {
    if (embedded) {
      onRequestClose?.();
      return;
    }
    setOpen(false);
  };

  return (
    <div
      className={
        embedded
          ? "h-full w-full text-white"
          : "fixed bottom-4 right-4 z-[80] w-[min(92vw,380px)] text-white"
      }
    >
      {!embedded && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-full border border-cyan-400/40 bg-[#04050d]/90 px-4 py-2 text-sm font-semibold shadow-[0_0_22px_rgba(6,182,212,0.35)] hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.55)]"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Vueverse AI
        </button>
      )}

      {(embedded || open) && (
        <div
          className={
            embedded
              ? "flex h-full flex-col overflow-hidden border border-cyan-500/30 bg-[#05070f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              : "overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#05070f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          }
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                {VUEVERSE_SITE_NAME} Assistant
              </p>
              <p className="text-sm text-gray-200">Answers + Intent-Based Actions</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded border border-white/20 px-2 py-1 text-xs text-gray-200 hover:border-white/40"
              aria-label="Close AI assistant"
            >
              Close
            </button>
          </div>

          <div
            className={
              embedded
                ? "min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm"
                : "max-h-[400px] space-y-3 overflow-y-auto px-4 py-4 text-sm"
            }
          >
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

            {sending && (
              <div className="text-xs uppercase tracking-[0.16em] text-cyan-300">
                Thinking...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="overflow-x-auto border-t border-cyan-500/20 px-4 py-2">
            <div className="inline-flex min-w-max gap-2 whitespace-nowrap">
              <button
                type="button"
                onClick={() => {
                  void runQuickAction("schedule");
                }}
                className="rounded-full border border-cyan-400/50 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/30"
              >
                Schedule a Meeting
              </button>
              <button
                type="button"
                onClick={() => {
                  void runQuickAction("contact");
                }}
                className="rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30"
              >
                Send a Message
              </button>
              <button
                type="button"
                onClick={() => {
                  void runQuickAction("overview");
                }}
                className="rounded-full border border-purple-400/50 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-100 hover:bg-purple-500/30"
              >
                Learn About {VUEVERSE_SITE_NAME}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-cyan-500/20 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Ask about ${VUEVERSE_SITE_NAME}, meeting, or contact`}
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
