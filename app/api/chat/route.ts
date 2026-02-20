import { NextResponse } from "next/server";
import { AGENT_SYSTEM_PROMPT } from "@/app/lib/portfolioAgent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ToolCall = {
  name: string;
  args: Record<string, unknown>;
};

type GeminiPart = {
  text?: string;
  functionCall?: {
    name?: string;
    args?: unknown;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
};

const FUNCTION_DECLARATIONS = [
  {
    name: "open_link",
    description: "Open one of the known portfolio links.",
    parameters: {
      type: "OBJECT",
      properties: {
        target: {
          type: "STRING",
          enum: ["linkedin", "github", "resume", "home"],
          description: "The named destination to open.",
        },
      },
      required: ["target"],
    },
  },
  {
    name: "redirect_to_section",
    description: "Navigate to a section within the portfolio page.",
    parameters: {
      type: "OBJECT",
      properties: {
        section: {
          type: "STRING",
          enum: ["top", "about", "experience", "projects", "connect"],
          description: "Section id to scroll to.",
        },
      },
      required: ["section"],
    },
  },
  {
    name: "schedule_meeting",
    description: "Create a scheduling draft in Google Calendar.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: {
          type: "STRING",
          description: "Meeting title.",
        },
        date: {
          type: "STRING",
          description: "Date in YYYY-MM-DD format.",
        },
        time: {
          type: "STRING",
          description: "Start time in HH:mm 24-hour format.",
        },
        timezone: {
          type: "STRING",
          description: "IANA timezone, for example Asia/Kolkata.",
        },
        durationMinutes: {
          type: "NUMBER",
          description: "Duration in minutes. Defaults to 30.",
        },
        details: {
          type: "STRING",
          description: "Additional context for the calendar invite.",
        },
      },
    },
  },
  {
    name: "send_message",
    description: "Prepare a contact message for the connect section.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: {
          type: "STRING",
          description: "Sender name.",
        },
        email: {
          type: "STRING",
          description: "Sender email.",
        },
        subject: {
          type: "STRING",
          description: "Message subject.",
        },
        message: {
          type: "STRING",
          description: "Message body.",
        },
      },
      required: ["message"],
    },
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((msg): msg is ChatMessage => {
      if (!isRecord(msg)) return false;
      const role = msg.role;
      const content = msg.content;
      return (role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0;
    })
    .map((msg) => ({ role: msg.role, content: msg.content.trim() }))
    .slice(-12);
}

export async function POST(request: Request) {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasGoogleKey = Boolean(process.env.GOOGLE_API_KEY);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing Gemini API key. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in Vercel environment variables and redeploy.",
        debug: {
          hasGeminiKey,
          hasGoogleKey,
          vercelEnv: process.env.VERCEL_ENV ?? null,
          deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
          region: process.env.VERCEL_REGION ?? null,
        },
      },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const body = isRecord(payload) ? payload : {};
  const messages = normalizeMessages(body.messages);

  if (!messages.length) {
    return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
  }

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: AGENT_SYSTEM_PROMPT.trim() }],
      },
      contents,
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      toolConfig: {
        functionCallingConfig: {
          mode: "AUTO",
        },
      },
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return NextResponse.json(
      {
        error: "Gemini request failed",
        details: errorText.slice(0, 400),
      },
      { status: geminiResponse.status },
    );
  }

  const data = (await geminiResponse.json()) as GeminiResponse;
  const parts = data.candidates?.[0]?.content?.parts ?? [];

  const text = parts
    .filter((part) => typeof part.text === "string")
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  const toolCalls: ToolCall[] = parts
    .filter((part) => typeof part.functionCall?.name === "string")
    .map((part) => ({
      name: part.functionCall?.name || "",
      args: isRecord(part.functionCall?.args) ? part.functionCall.args : {},
    }))
    .filter((tool) => tool.name.length > 0);

  if (!text && !toolCalls.length && data.promptFeedback?.blockReason) {
    return NextResponse.json({
      text: "I cannot help with that request as currently phrased.",
      toolCalls: [],
      blockedReason: data.promptFeedback.blockReason,
    });
  }

  return NextResponse.json({
    text,
    toolCalls,
  });
}
