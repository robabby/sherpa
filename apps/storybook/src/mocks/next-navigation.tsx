export function useRouter() {
  return {
    push: (url: string) => {
      window.location.href = url
    },
    replace: (url: string) => {
      window.location.href = url
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  }
}

export function usePathname() {
  return "/"
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function useParams() {
  return {}
}

export function redirect(url: string) {
  window.location.href = url
}
