"use server"

import { z } from "zod"
import { Resend } from "resend"
import { ContactNotification } from "@/emails/contact-notification"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  interest: z.enum(["workshops", "consulting", "governance", "other"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export type ContactFormState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string[]>>
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    interest: formData.get("interest"),
    message: formData.get("message"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured")
    return { success: false, error: "Contact form is not configured yet." }
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: "Sherpa Website <onboarding@resend.dev>",
      to: ["rob@sherpa.solar"],
      subject: `New inquiry from ${parsed.data.name}`,
      react: ContactNotification(parsed.data),
    })

    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
