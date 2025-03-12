import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // In a real application, you would validate the email format and check if it already exists
    
    // Hash the password (in a real app)
    const hashedPassword = await hash(password, 12);

    // In a real application, you would save this user to your database
    // For now, we'll just return a success response
    
    // Make request to your backend API if needed
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const response = await fetch(`${apiUrl}/api/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, hashedPassword }),
    // });
    // 
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message || 'Failed to register');
    // }

    return res.status(201).json({ 
      message: 'User created successfully',
      user: { 
        id: 'temp-user-id',
        name, 
        email 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred during registration'
    });
  }
}
