/**
 * Standardized client-side API error handling
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      // Try to get structured error from API
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If can't parse JSON, try to get text
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // If all fails, use the status message
      }
    }
    
    throw new Error(errorMessage);
  }
  
  // Parse JSON response, with fallback for empty responses
  try {
    return await response.json();
  } catch (e) {
    if (response.status === 204) {
      // No content is a valid response for some APIs
      return {} as T;
    }
    throw new Error('Failed to parse API response');
  }
}
