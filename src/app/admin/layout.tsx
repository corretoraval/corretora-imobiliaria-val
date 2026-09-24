import {
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export const metadata = {
  title: "Corretora Val | Admin",
};

const navigation = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/conteudo", label: "Páginas e conteúdo", icon: BookOpen },
  {
    href: "/admin/configuracoes",
    label: "Configurações do site",
    icon: Settings,
  },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin")
    redirect("/auth/signin?callbackUrl=/admin");

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--ink)] lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="flex flex-col border-b bg-[var(--plum)] p-5 text-white lg:min-h-screen lg:border-r lg:border-b-0">
        <Link className="display text-3xl" href="/admin">
          Corretora Val
        </Link>
        <p className="mt-1 text-xs font-bold tracking-[0.12em] text-white/55 uppercase">
          Painel administrativo
        </p>
        <nav className="mt-7 grid gap-1" aria-label="Navegação do painel">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              className="interactive flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white"
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" size={18} /> {label}
            </Link>
          ))}
        </nav>
        <Link
          className="interactive mt-8 flex items-center gap-2 text-sm font-bold text-[var(--gold-light)] hover:text-white"
          href="/"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" size={16} /> Ver site público
        </Link>

        {/* Empurra o bloco do usuário para o rodapé da sidebar */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/15 pt-4 lg:mt-10">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {session.user.name || "Administrador"}
            </p>
            <p className="truncate text-xs text-white/55">
              {session.user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
