import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components"

interface ContactNotificationProps {
  name: string
  email: string
  interest: string
  message: string
}

const interestLabels: Record<string, string> = {
  workshops: "AI Literacy Workshops",
  consulting: "Agentic Workforce Consulting",
  governance: "Governance Implementation",
  other: "Other / General Inquiry",
}

export function ContactNotification({
  name,
  email,
  interest,
  message,
}: ContactNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafaf8" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ fontSize: "20px", color: "#1a1a1e" }}>
            New inquiry from {name}
          </Heading>
          <Hr style={{ borderColor: "#e4e0d8" }} />
          <Section>
            <Text style={{ color: "#71665a", fontSize: "14px" }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ color: "#71665a", fontSize: "14px" }}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={{ color: "#71665a", fontSize: "14px" }}>
              <strong>Interest:</strong> {interestLabels[interest] ?? interest}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e4e0d8" }} />
          <Section>
            <Text style={{ color: "#1a1a1e", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {message}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
