import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias (adequado ao uso prolongado do painel admin)
    updateAge: 24 * 60 * 60, // Renova a sessão a cada 24 horas enquanto o usuário estiver ativo
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias sincronizado com a sessão
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password)))
          return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      if (user) token.mustChangePassword = user.mustChangePassword;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? "user";
        session.user.mustChangePassword = token.mustChangePassword ?? false;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
};
