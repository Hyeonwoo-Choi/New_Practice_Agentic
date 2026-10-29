/** 로그에 비밀값이 남지 않게 한다. 환경변수의 키 값과 흔한 키 모양을 가린다 */
export function redact(text: string): string {
  let out = text;
  const key = process.env.LLM_API_KEY;
  if (key && key.length >= 6) out = out.split(key).join("[REDACTED]");
  return out
    .replace(/Bearer\s+[A-Za-z0-9._\-]{8,}/g, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_\-]{8,}/g, "[REDACTED]");
}

export function redactDeep<T>(value: T): T {
  if (typeof value === "string") return redact(value) as T;
  if (Array.isArray(value)) return value.map(redactDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactDeep(v)])) as T;
  }
  return value;
}
