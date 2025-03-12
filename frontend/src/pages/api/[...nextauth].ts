import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextApiRequest, NextApiResponse } from 'next';

// Check for required environment variables
const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Check API URL - critical for authentication
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL not set. Using fallback: http://localhost:5000');
}

// Custom error handler for the NextAuth API
async function errorHandler(error: Error, req: NextApiRequest, res: NextApiResponse) {
  console.error('NextAuth API error:', error);
  
  // Ensure a consistent response format even during errors
  res.status(500).json({
    error: 'Authentication service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
  });
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Safely get API base URL with fallback
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        try {
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
          
          const res = await fetch(`${apiBaseUrl}/api/users/login`, {
            method: 'POST',
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json" // Explicitly request JSON response
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Handle non-200 responses
          if (!res.ok) {
            console.error(`Authentication error: ${res.status} ${res.statusText}`);
            
            // Check content-type before attempting to parse
            const contentType = res.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
              try {
                const errorData = await res.json();
                console.error('API error details:', errorData);
              } catch (e) {
                console.error('Failed to parse JSON error response:', e);
              }
            } else {
              // Handle non-JSON responses safely
              const errorText = await res.text().catch(() => 'Could not extract error text');
              console.error('API returned non-JSON response:', errorText);
            }
            
            return null;
          }
          
          // Check content type before parsing
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.error(`API returned non-JSON content type: ${contentType}`);
            const text = await res.text().catch(() => '');
            console.error('Response text:', text);
            return null;
          }
          
          // Safely parse response
          let userData;
          try {
            userData = await res.json();
          } catch (jsonError) {
            console.error('Error parsing authentication response:', jsonError);
            const text = await res.text().catch(() => '');
            console.error('Failed to parse as JSON, raw text:', text.substring(0, 500));
            return null;
          }
          
          // Validate user data
          if (!userData || typeof userData !== 'object') {
            console.error('Invalid user data received from API:', userData);
            return null;
          }
          
          // Return standardized user object with safe property access
          return {
            id: userData._id || userData.id || '',
            name: userData.name || '',
            email: userData.email || '',
            isAdmin: userData.role === 'admin',
            token: userData.token || ''
          };
          
        } catch (error) {
          console.error('Error in authorize function:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only update token when user data is available (during sign-in)
      if (user) {
        try {
          token.id = user.id || '';
          token.isAdmin = !!user.isAdmin; // Ensure boolean
          token.accessToken = user.token || '';
        } catch (error) {
          console.error('Error in JWT callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      try {
        // Ensure session structure exists before accessing properties
        if (!session) session = { 
          user: { id: '', name: '', email: '', isAdmin: false },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        if (!session.user) session.user = { id: '', name: '', email: '', isAdmin: false };
        
        // Copy data from token to session with fallback values
        session.user.id = token?.id || '';
        session.user.isAdmin = !!token?.isAdmin;
        session.accessToken = token?.accessToken || '';
      } catch (error) {
        console.error('Error in session callback:', error);
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error (${code}):`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`NextAuth debug (${code}):`, metadata);
      }
    }
  },
  // Custom error handling for the NextAuth API endpoints
  events: {
    signIn: (message) => {
      console.log('NextAuth signIn event:', message);
    },
    signOut: () => {
      console.log('NextAuth signOut event');
    },
    session: () => {
      // Session was accessed (verbose, only enable for debugging)
      // console.log('Session access');
    }
  },
  // Rethrow API errors only in development for better debugging
  useSecureCookies: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https')
  // Error handling is already configured through the logger and events options above
});
