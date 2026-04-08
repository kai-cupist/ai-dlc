export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function isValidQuantity(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}
