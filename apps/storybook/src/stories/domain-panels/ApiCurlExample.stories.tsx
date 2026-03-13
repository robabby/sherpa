import type { Meta, StoryObj } from "@storybook/react"
import { ApiCurlExample } from "@sherpa/studio-ui/api-curl-example"

const meta = {
  title: "Domain Panels/ApiCurlExample",
  component: ApiCurlExample,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApiCurlExample>

export default meta
type Story = StoryObj<typeof meta>

export const GetWithAuth: Story = {
  args: {
    method: "GET",
    path: "/api/transit/events",
    auth: "required",
  },
}

export const GetNoAuth: Story = {
  args: {
    method: "GET",
    path: "/api/health",
    auth: "none",
  },
}

export const PostWithAuth: Story = {
  args: {
    method: "POST",
    path: "/api/charts/generate",
    auth: "required",
  },
}

export const PostNoAuth: Story = {
  args: {
    method: "POST",
    path: "/api/webhooks/ingest",
    auth: "none",
  },
}

export const Gallery: Story = {
  decorators: [
    (Story) => (
      <div className="w-[600px] space-y-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <ApiCurlExample method="GET" path="/api/transit/events" auth="required" />
      <ApiCurlExample method="POST" path="/api/charts/generate" auth="required" />
      <ApiCurlExample method="GET" path="/api/health" auth="none" />
    </>
  ),
}
