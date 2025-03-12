export function checkEnvironmentVariables() {
  // Only check public variables on the client
  const requiredVars = ['NEXT_PUBLIC_API_URL'];
  let valid = true;
  const issues: string[] = [];

  requiredVars.forEach((varName) => {
    const value = (process.env[varName] || '').trim();
    if (value === '') {
      valid = false;
      issues.push(`Missing environment variable: ${varName}`);
    }
  });

  return { valid, issues };
}
