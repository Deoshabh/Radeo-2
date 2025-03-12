import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
export default NextAuth({
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Call your API to verify credentials
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiBaseUrl}/api/users/login`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });
                const user = await res.json();
                if (res.ok && user) {
                    return user;
                }
                return null;
            }
        })
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.isAdmin = user.isAdmin;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                session.user.id = token.id;
                session.user.isAdmin = token.isAdmin;
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
    },
});
