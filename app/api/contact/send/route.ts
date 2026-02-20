import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

type MailTransport = {
  verify: () => Promise<unknown>;
  sendMail: (mail: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

type NodemailerLike = {
  createTransport: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) => MailTransport;
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

async function loadNodemailer(): Promise<NodemailerLike | null> {
  try {
    const moduleName = "nodemailer";
    const imported = (await import(moduleName)) as unknown;

    if (!isRecord(imported)) {
      return null;
    }

    const source = isRecord(imported.default) ? imported.default : imported;
    const createTransport = source.createTransport;

    if (typeof createTransport !== "function") {
      return null;
    }

    return {
      createTransport: createTransport as NodemailerLike["createTransport"],
    };
  } catch {
    return null;
  }
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
    return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const smtpFrom = process.env.SMTP_FROM_EMAIL || smtpUser;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !receiverEmail || Number.isNaN(smtpPort)) {
    return NextResponse.json(
      {
        error:
          "Mail service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_RECEIVER_EMAIL.",
      },
      { status: 500 },
    );
  }

  const nodemailer = await loadNodemailer();
  if (!nodemailer) {
    return NextResponse.json(
      {
        error: "Nodemailer is not installed. Add nodemailer dependency and redeploy.",
      },
      { status: 500 },
    );
  }

  const secure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transport.verify();
  } catch {
    return NextResponse.json({ error: "SMTP verification failed." }, { status: 500 });
  }

  const normalizedSubject = subject || `Portfolio chatbot message from ${name || email}`;
  const normalizedName = name || "Not provided";

  const text = [
    "New message from portfolio chatbot",
    `Name: ${normalizedName}`,
    `Email: ${email}`,
    `Subject: ${normalizedSubject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <h2>New message from portfolio chatbot</h2>
    <p><strong>Name:</strong> ${escapeHtml(normalizedName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(normalizedSubject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  try {
    await transport.sendMail({
      from: smtpFrom,
      to: receiverEmail,
      replyTo: email,
      subject: normalizedSubject,
      text,
      html,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Message sent successfully. Kalyan will get it by email.",
  });
}
