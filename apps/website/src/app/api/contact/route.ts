import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  message: z.string().min(1).max(5000),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Name, a valid email, and a message are required." },
      { status: 400 },
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set")
    return NextResponse.json(
      { error: "The contact form is not configured yet. Please try again later." },
      { status: 503 },
    )
  }

  const { name, email, message } = parsed.data
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "Sherpa Contact <contact@sherpa.solar>",
    to,
    replyTo: email,
    subject: `sherpa.solar contact — ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  })

  if (error) {
    console.error("[contact] Resend error:", error)
    return NextResponse.json(
      { error: "Sending failed. Please try again later." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
