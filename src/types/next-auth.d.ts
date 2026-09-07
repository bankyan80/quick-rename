import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId?: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    sub?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
  }
}