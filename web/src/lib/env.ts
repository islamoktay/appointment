/**
 * Server-side BFF configuration. Never place secrets in NEXT_PUBLIC_* variables.
 */
export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:8080";
}
