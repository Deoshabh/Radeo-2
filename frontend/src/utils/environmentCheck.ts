/**
 * Utility function to check required environment variables
 */
export function checkEnvironmentVariables() {
  const issues: string[] = [];
  
  // Check for required environment variables
  const requiredVars: string[] = [
    // Add any critical environment variables your app needs
    // 'NEXT_PUBLIC_API_URL',
    // 'NEXTAUTH_URL',
    // 'NEXTAUTH_SECRET',
  ];
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      issues.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Check for API URL format
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
    issues.push('NEXT_PUBLIC_API_URL should start with http:// or https://');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
