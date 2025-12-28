export function persianToEnglishNumber(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
