import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: string;
      mustChangePassword: boolean;
    };
  }

  interface User {
    role: string;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    mustChangePassword?: boolean;
  }
}
