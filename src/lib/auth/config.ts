import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        token.googleId = account.providerAccountId;
        const dbUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
          select: { id: true },
        });
        token.uid = dbUser?.id;
        return token;
      }
      if (!token.uid && token.googleId) {
        const dbUser = await prisma.user.findUnique({
          where: { googleId: token.googleId as string },
          select: { id: true },
        });
        if (dbUser) token.uid = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) || (token.sub as string);
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.providerAccountId) {
        try {
          const existing = await prisma.user.findUnique({
            where: { googleId: account.providerAccountId },
          });

          if (existing) {
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                lastLoginAt: new Date(),
                name: user.name || existing.name,
                email: user.email || existing.email,
                avatarUrl: user.image || existing.avatarUrl,
              },
            });
          } else {
            await prisma.user.create({
              data: {
                googleId: account.providerAccountId,
                email: user.email || "",
                name: user.name || "User",
                avatarUrl: user.image,
                lastLoginAt: new Date(),
                tokenAccount: {
                  create: {
                    balance: 0,
                  },
                },
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return true;
        }
      }
      return true;
    },
  },
});