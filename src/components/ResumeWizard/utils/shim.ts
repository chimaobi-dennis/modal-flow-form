// Utility shims to replace @reactive-resume/utils
export const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

export const isEmptyString = (v?: string | null) => !v || v.trim().length === 0;

export const isUrl = (href?: string) => {
  if (!href) return false;
  try {
    const u = new URL(href);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
};

export const sanitize = (html?: string) => html ?? ""; // assume trusted input upstream

export const linearTransform = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) => {
  if (fromMax === fromMin) return toMin;
  const ratio = (value - fromMin) / (fromMax - fromMin);
  return toMin + ratio * (toMax - toMin);
};

// Minimal lodash.get replacement
export function get<T = any, D = any>(obj: T, path?: string | Array<string | number>, defaultValue?: D): any {
  if (obj == null || !path) return defaultValue;
  const segments = Array.isArray(path)
    ? path.map(String)
    : String(path)
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean);
  let current: any = obj;
  for (const key of segments) {
    if (current == null) return defaultValue;
    current = current[key as keyof typeof current];
  }
  return current === undefined ? defaultValue : current;
}
