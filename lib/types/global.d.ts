export {}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'js' | 'set',
      ...args: unknown[]
    ) => void
  }
}
