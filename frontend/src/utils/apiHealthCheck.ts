/**
 * Utility to check if the API is reachable
 */
export async function checkApiHealth(apiUrl?: string): Promise<boolean> {
  try {
    const url = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${url}/api/health`, { 
      signal: controller.signal,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
