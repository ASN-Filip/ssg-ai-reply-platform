// Re-export provider-based hook from the UI toast implementation so callers
// can keep importing `useToast` from this path while we migrate away from
// the legacy zustand store.
export { useToast } from '@/components/ui/Toast'
