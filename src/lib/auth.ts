import { NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        (session.user as ExtendedUser).id = user.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
}

export const getAuthSession = () => getServerSession(authOptions)