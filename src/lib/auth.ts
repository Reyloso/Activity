import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || user.isBlocked) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: `${user.name} ${user.lastName}`,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.blocked = false;
        return token;
      }
      const current = await db.user.findUnique({ where: { id: token.sub } });
      token.role = current?.role ?? "MEMBER";
      token.blocked = !current || current.isBlocked;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as "ADMIN" | "MEMBER";
        session.user.id = token.sub as string;
        session.user.blocked = token.blocked as boolean;
      }
      return session;
    },
  },
});
