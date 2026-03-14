"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitContactForm, type ContactFormState } from "@/app/(marketing)/contact/actions"
import { Send, CheckCircle } from "lucide-react"

const interests = [
  { value: "workshops", label: "AI Literacy Workshops" },
  { value: "consulting", label: "Agentic Workforce Consulting" },
  { value: "governance", label: "Governance Implementation" },
  { value: "other", label: "Other / General Inquiry" },
]

const initialState: ContactFormState = { success: false }

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-12 text-center">
        <CheckCircle className="size-8 text-primary" />
        <p className="mt-4 font-heading text-xl">Message sent</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          aria-invalid={!!state.fieldErrors?.name}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest">What are you interested in?</Label>
        <select
          id="interest"
          name="interest"
          required
          className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Select an option</option>
          {interests.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.interest && (
          <p className="text-xs text-destructive">{state.fieldErrors.interest[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          className="min-h-32"
          aria-invalid={!!state.fieldErrors?.message}
        />
        {state.fieldErrors?.message && (
          <p className="text-xs text-destructive">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send message"}
        <Send data-icon="inline-end" />
      </Button>
    </form>
  )
}
