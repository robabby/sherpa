import type { Preview } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"

import "@radix-ui/themes/styles.css"
import "../src/styles/storybook-globals.css"

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: "centered",
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "dark",
    }),
  ],
}

export default preview
