import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      isAdmin: boolean;
    };
    accessToken?: string;
  }
  
  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    isAdmin: boolean;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    accessToken?: string;
  }
}