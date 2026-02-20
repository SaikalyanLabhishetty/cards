import { NextResponse } from "next/server";
import { AGENT_SYSTEM_PROMPT } from "@/app/lib/portfolioAgent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent`;

// `open-mistral-nemo` is a common low-cost/free-tier compatible default on Mistral.
const MISTRAL_MODEL_NAME = process.env.MISTRAL_MODEL || "open-mistral-nemo";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ToolCall = {
  name: string;
  args: Record<string, unknown>;
};

type ProviderSuccess = {
  ok: true;
  provider: "gemini" | "mistral";
  text: string;
  toolCalls: ToolCall[];
  blockedReason?: string;
};

type ProviderFailure = {
  ok: false;
  provider: "gemini" | "mistral";
  status: number;
  error: string;
  details?: string;
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

type MistralToolCall = {
  function?: {
    name?: string;
    arguments?: unknown;
  };
};

type MistralResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
      tool_calls?: MistralToolCall[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const GEMINI_FUNCTION_DECLARATIONS = [
  {
    name: "open_link",
    description: "Open one of the known portfolio links.",
    parameters: {
      type: "OBJECT",
      properties: {
        target: {
          type: "STRING",
          enum: ["linkedin", "github", "resume", "home", "calendly"],
          description: "The named destination to open.",
        },
      },
      required: ["target"],
    },
  },
  {
    name: "schedule_meeting",
    description: "Open the Calendly scheduling link for booking a meeting.",
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
      required: ["email", "message"],
    },
  },
];

const MISTRAL_TOOLS = [
  {
    type: "function",
    function: {
      name: "open_link",
      description: "Open one of the known portfolio links.",
      parameters: {
        type: "object",
        properties: {
          target: {
            type: "string",
            enum: ["linkedin", "github", "resume", "home", "calendly"],
            description: "The named destination to open.",
          },
        },
        required: ["target"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_meeting",
      description: "Open the Calendly scheduling link for booking a meeting.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Meeting title.",
          },
          date: {
            type: "string",
            description: "Date in YYYY-MM-DD format.",
          },
          time: {
            type: "string",
            description: "Start time in HH:mm 24-hour format.",
          },
          timezone: {
            type: "string",
            description: "IANA timezone, for example Asia/Kolkata.",
          },
          durationMinutes: {
            type: "number",
            description: "Duration in minutes. Defaults to 30.",
          },
          details: {
            type: "string",
            description: "Additional context for the calendar invite.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_message",
      description: "Prepare a contact message for the connect section.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Sender name.",
          },
          email: {
            type: "string",
            description: "Sender email.",
          },
          subject: {
            type: "string",
            description: "Message subject.",
          },
          message: {
            type: "string",
            description: "Message body.",
          },
        },
        required: ["email", "message"],
      },
    },
  },
] as const;

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

function parseMistralContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (!isRecord(item)) return "";
      const text = item.text;
      return typeof text === "string" ? text.trim() : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseUnknownJson(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function callGemini(messages: ChatMessage[], apiKey: string): Promise<ProviderSuccess | ProviderFailure> {
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: AGENT_SYSTEM_PROMPT.trim() }],
        },
        contents,
        tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }],
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini network request failed";
    return {
      ok: false,
      provider: "gemini",
      status: 502,
      error: "Gemini request failed",
      details: message,
    };
  }

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return {
      ok: false,
      provider: "gemini",
      status: geminiResponse.status,
      error: "Gemini request failed",
      details: errorText.slice(0, 1000),
    };
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

  return {
    ok: true,
    provider: "gemini",
    text,
    toolCalls,
    blockedReason: data.promptFeedback?.blockReason,
  };
}

async function callMistral(messages: ChatMessage[], apiKey: string): Promise<ProviderSuccess | ProviderFailure> {
  const mistralMessages = [
    {
      role: "system",
      content: AGENT_SYSTEM_PROMPT.trim(),
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  let mistralResponse: Response;
  try {
    mistralResponse = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL_NAME,
        messages: mistralMessages,
        temperature: 0.45,
        max_tokens: 1024,
        tools: MISTRAL_TOOLS,
        tool_choice: "auto",
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mistral network request failed";
    return {
      ok: false,
      provider: "mistral",
      status: 502,
      error: "Mistral request failed",
      details: message,
    };
  }

  if (!mistralResponse.ok) {
    const errorText = await mistralResponse.text();
    return {
      ok: false,
      provider: "mistral",
      status: mistralResponse.status,
      error: "Mistral request failed",
      details: errorText.slice(0, 1000),
    };
  }

  const data = (await mistralResponse.json()) as MistralResponse;

  if (data.error?.message) {
    return {
      ok: false,
      provider: "mistral",
      status: 502,
      error: "Mistral request failed",
      details: data.error.message,
    };
  }

  const message = data.choices?.[0]?.message;
  const text = parseMistralContent(message?.content);
  const toolCalls: ToolCall[] = (message?.tool_calls ?? [])
    .map((toolCall) => ({
      name: typeof toolCall.function?.name === "string" ? toolCall.function.name : "",
      args: parseUnknownJson(toolCall.function?.arguments),
    }))
    .filter((toolCall) => toolCall.name.length > 0);

  return {
    ok: true,
    provider: "mistral",
    text,
    toolCalls,
  };
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const mistralApiKey = process.env.MISTRAL_API_KEY || "";

  const hasGeminiKey = Boolean(geminiApiKey);
  const hasMistralKey = Boolean(mistralApiKey);

  if (!hasGeminiKey && !hasMistralKey) {
    return NextResponse.json(
      {
        error:
          "Missing API keys. Set GEMINI_API_KEY (or GOOGLE_API_KEY) and/or MISTRAL_API_KEY in Vercel environment variables and redeploy.",
        debug: {
          hasGeminiKey,
          hasMistralKey,
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

  let geminiFailure: ProviderFailure | null = null;

  if (hasGeminiKey) {
    const geminiResult = await callGemini(messages, geminiApiKey);

    if (geminiResult.ok) {
      if (!geminiResult.text && !geminiResult.toolCalls.length && geminiResult.blockedReason) {
        return NextResponse.json({
          text: "I cannot help with that request as currently phrased.",
          toolCalls: [],
          blockedReason: geminiResult.blockedReason,
          provider: "gemini",
        });
      }

      return NextResponse.json({
        text: geminiResult.text,
        toolCalls: geminiResult.toolCalls,
        provider: "gemini",
      });
    }

    geminiFailure = geminiResult;
  }

  if (hasMistralKey) {
    const mistralResult = await callMistral(messages, mistralApiKey);

    if (mistralResult.ok) {
      return NextResponse.json({
        text: mistralResult.text,
        toolCalls: mistralResult.toolCalls,
        provider: "mistral",
        fallbackFrom: geminiFailure ? "gemini" : undefined,
      });
    }

    return NextResponse.json(
      {
        error: "Both Gemini and Mistral requests failed",
        gemini: geminiFailure,
        mistral: mistralResult,
      },
      { status: mistralResult.status || 502 },
    );
  }

  return NextResponse.json(
    {
      error: "Gemini request failed and Mistral fallback is not configured",
      details: geminiFailure?.details ?? "Unknown Gemini failure",
      hint: "Set MISTRAL_API_KEY in Vercel to enable fallback.",
      gemini: geminiFailure,
    },
    { status: geminiFailure?.status || 502 },
  );
}
