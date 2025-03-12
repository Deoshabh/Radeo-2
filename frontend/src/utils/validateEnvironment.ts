/**
 * Validates critical environment variables at runtime
 * Run this at application startup to catch configuration issues early
 */
export function validateEnvironment(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Critical environment variables that must be present
  const requiredVars = [
    { key: 'NEXTAUTH_URL', message: 'Authentication URL not set - critical for NextAuth callbacks' },
    { key: 'NEXTAUTH_SECRET', message: 'Authentication secret not set - required for secure JWT tokens' },
    { key: 'NEXT_PUBLIC_API_URL', message: 'API URL not set - required for backend communication' }
  ];

  // Check each required variable
  requiredVars.forEach(({ key, message }) => {
    if (!process.env[key]) {
      issues.push(message);
    }
  });

  // Additional validation for URL format
  if (process.env.NEXTAUTH_URL && !isValidUrl(process.env.NEXTAUTH_URL)) {
    issues.push(`NEXTAUTH_URL (${process.env.NEXTAUTH_URL}) is not a valid URL`);
  }

  if (process.env.NEXT_PUBLIC_API_URL && !isValidUrl(process.env.NEXT_PUBLIC_API_URL)) {
    issues.push(`NEXT_PUBLIC_API_URL (${process.env.NEXT_PUBLIC_API_URL}) is not a valid URL`);
  }

  // Ensure NEXTAUTH_URL doesn't have trailing slash
  if (process.env.NEXTAUTH_URL?.endsWith('/')) {
    issues.push('NEXTAUTH_URL should not end with a trailing slash');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Validates URL format
 */
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}
