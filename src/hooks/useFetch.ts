import { useCsrfToken } from "@/components/providers/CsrfProvider";

export function useFetch() {
  const csrfToken = useCsrfToken();

  return async (url: string, options: RequestInit = {}) => {
    const method = options.method?.toUpperCase() || "GET";

    // Add CSRF token to non-GET requests
    if (method !== "GET" && method !== "HEAD" && csrfToken) {
      const headers = new Headers(options.headers);
      headers.set("x-csrf-token", csrfToken);
      options.headers = headers;
    }

    return fetch(url, options);
  };
}
