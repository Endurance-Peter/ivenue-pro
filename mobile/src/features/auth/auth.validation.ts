export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isPhoneValid(phone: string): boolean {
  return normalizePhone(phone).length >= 10;
}

export function isCodeValid(code: string): boolean {
  return code.length === 6;
}
