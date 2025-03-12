import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint for collecting client-side errors
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { errors } = req.body;

    if (!Array.isArray(errors)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Log errors to your preferred logging service
    // This is a simple console log example, but you should replace this
    // with a proper logging service in production
    for (const error of errors) {
      console.error('Client error:', JSON.stringify(error, null, 2));
      
      // Here you could send errors to a service like Sentry, LogRocket, etc.
      // Example: await sentry.captureException(new Error(error.message), { extra: error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging client errors:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
