// lib/templateFiller.ts
export function fillTemplate(
  template: string,
  data: Record<string, string | number>
): string {
  return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
    const value = data[key];
    // Convert non-string values to string, return empty string if undefined
    return value !== undefined && value !== null ? String(value) : "";
  });
}
