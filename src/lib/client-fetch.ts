/**
 * 클라이언트에서 JSON API를 부르고 결과를 안전하게 파싱하는 헬퍼.
 * 같은 fetch+then+catch+finally 패턴이 여러 컴포넌트에서 반복되어 통합.
 *
 * - 4xx/5xx 응답은 null 반환 (호출자가 fallback 처리 책임).
 * - 네트워크 에러는 throw하지 않고 null 반환.
 *
 * 호출자가 에러 메시지를 구분할 필요가 있으면 fetch를 직접 쓸 것.
 */
export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** POST + JSON body 간편 호출 */
export function postJson<T = unknown>(url: string, body: unknown, init?: RequestInit) {
  return fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
}
