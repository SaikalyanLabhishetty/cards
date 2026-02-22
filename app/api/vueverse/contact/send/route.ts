import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function extractErrorMessage(input: unknown) {
  if (!isRecord(input)) {
    return "";
  }

  const directMessage = input.message;
  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage.trim();
  }

  const nestedError = input.error;
  if (isRecord(nestedError)) {
    const nestedMessage = nestedError.message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage.trim();
    }
  }

  return "";
}

export async function POST(request: Request) {
  let payloadRaw: unknown;
  try {
    payloadRaw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const payload = isRecord(payloadRaw) ? (payloadRaw as ContactPayload) : {};
  const name = readString(payload.name);
  const email = readString(payload.email);
  const subject = readString(payload.subject);
  const message = readString(payload.message);

  if (!email || !message) {
    return NextResponse.json(
      { error: "Email and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const resendApiKey =
    readString(process.env.VUEVERSE_RESEND_API_KEY) ||
    readString(process.env.RESEND_API_KEY);
  const resendFromEmail =
    readString(process.env.VUEVERSE_RESEND_FROM_EMAIL) ||
    readString(process.env.RESEND_FROM_EMAIL);
  const resendApiUrl =
    readString(process.env.VUEVERSE_RESEND_API_URL) ||
    "https://api.resend.com/emails";
  const contactReceiver =
    readString(process.env.VUEVERSE_CONTACT_RECEIVER_EMAIL) ||
    readString(process.env.CONTACT_RECEIVER_EMAIL);

  const contactTeamName = "Vueverse team";

  if (!resendApiKey || !resendFromEmail || !contactReceiver) {
    return NextResponse.json(
      {
        error:
          "Resend is not configured. Set VUEVERSE_RESEND_API_KEY, VUEVERSE_RESEND_FROM_EMAIL, and VUEVERSE_CONTACT_RECEIVER_EMAIL.",
      },
      { status: 500 },
    );
  }

  const normalizedSubject = subject || `Vueverse chatbot message from ${name || email}`;
  const normalizedName = name || "Not provided";

  const text = [
    "New message from Vueverse chatbot",
    `Name: ${normalizedName}`,
    `Email: ${email}`,
    `Subject: ${normalizedSubject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <h2>New message from Vueverse chatbot</h2>
    <p><strong>Name:</strong> ${escapeHtml(normalizedName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(normalizedSubject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  let resendResponse: Response;
  try {
    resendResponse = await fetch(resendApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [contactReceiver],
        reply_to: email,
        subject: normalizedSubject,
        text,
        html,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Resend API." },
      { status: 502 },
    );
  }

  if (!resendResponse.ok) {
    let errorMessage = "";

    try {
      const data = (await resendResponse.json()) as unknown;
      errorMessage = extractErrorMessage(data);
    } catch {
      errorMessage = "";
    }

    return NextResponse.json(
      { error: errorMessage || "Resend failed to send email." },
      { status: resendResponse.status || 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Message sent successfully. ${contactTeamName} will get it by email.`,
  });
}
