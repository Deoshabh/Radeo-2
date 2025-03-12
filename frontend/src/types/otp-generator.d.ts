declare module 'otp-generator' {
  export function generate(length: number, options?: {
    digits?: boolean;
    upperCaseAlphabets?: boolean;
    lowerCaseAlphabets?: boolean;
    specialChars?: boolean;
  }): string;
}
