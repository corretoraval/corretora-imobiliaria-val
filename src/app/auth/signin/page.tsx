"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const requestedPath = new URLSearchParams(window.location.search).get(
        "callbackUrl",
      );
      const callbackUrl =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/admin/imoveis";

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(
          "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.",
        );
        setIsLoading(false);
      } else {
        const session = await getSession();
        const destination = session?.user.mustChangePassword
          ? `/auth/change-password?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : callbackUrl;
        router.replace(destination);
        router.refresh();
      }
    } catch {
      setError(
        "Ocorreu um erro inesperado ao tentar entrar. Tente novamente mais tarde.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-12">
      {/* Painel Esquerdo: Identidade de Marca (Visível em telas grandes) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--plum)] p-12 text-white lg:col-span-5 lg:flex xl:col-span-6">
        {/* Padrão geométrico decorativo sutil */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--plum-bright)] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--gold)] opacity-15 blur-3xl" />

        {/* Topo do Painel */}
        <div className="relative z-10">
          <Link
            className="interactive inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--gold-light)] backdrop-blur-md hover:bg-white/10 hover:text-white"
            href="/"
          >
            <ArrowLeft size={14} /> Voltar ao site público
          </Link>
        </div>

        {/* Centro do Painel */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-[var(--gold-light)] uppercase backdrop-blur-md">
            <Building2 size={16} /> Corretora Val
          </div>

          <h1 className="display text-4xl font-normal leading-tight text-white xl:text-5xl">
            Gestão Inteligente &amp; Exclusiva de Imóveis
          </h1>

          <p className="text-sm leading-relaxed text-white/75 xl:text-base">
            Painel administrativo reservado para gerenciamento de carteira de
            imóveis, captura de leads, publicação de páginas e controle de
            contratos.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/15">
            <div>
              <p className="text-2xl font-bold text-[var(--gold-light)]">
                +30 Anos
              </p>
              <p className="text-xs text-white/60">Tradição &amp; Confiança</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--gold-light)]">
                SC 56372-F
              </p>
              <p className="text-xs text-white/60">Registro CRECI</p>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-6">
          <span>
            &copy; {new Date().getFullYear()} Corretora Val. Todos os direitos
            reservados.
          </span>
          <span className="flex items-center gap-1 text-[var(--gold-light)]">
            <ShieldCheck size={14} /> Conexão Segura SSL
          </span>
        </div>
      </div>

      {/* Painel Direito: Formulário de Login */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:col-span-7 lg:px-16 xl:col-span-6">
        <div className="mx-auto w-full max-w-md space-y-8 fade-up">
          {/* Link para voltar no Mobile */}
          <div className="lg:hidden">
            <Link
              className="interactive inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--plum)]"
              href="/"
            >
              <ArrowLeft size={14} /> Voltar ao site público
            </Link>
          </div>

          {/* Cabeçalho do Formulário */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--gold)]">
              <ShieldCheck size={14} /> Área Restrita
            </div>
            <h2 className="display mt-3 text-3xl font-bold text-[var(--plum)] sm:text-4xl">
              Entrar no Painel
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Digite seu e-mail e senha cadastrados para acessar o sistema.
            </p>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div
              className="fade-up flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800"
              role="alert"
            >
              <ShieldAlert className="mt-0.5 shrink-0 text-red-600" size={18} />
              <div className="flex-1">
                <p className="font-semibold">Falha na autenticação</p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold tracking-wider text-[var(--ink)] uppercase"
              >
                E-mail Profissional
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ink-soft)]">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com.br"
                  className="interactive block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm text-[var(--ink)] shadow-xs placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--plum)] focus:bg-white focus:ring-2 focus:ring-[var(--plum)]/10 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold tracking-wider text-[var(--ink)] uppercase"
                >
                  Senha de Acesso
                </label>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ink-soft)]">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="interactive block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-11 pr-11 text-sm text-[var(--ink)] shadow-xs placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--plum)] focus:bg-white focus:ring-2 focus:ring-[var(--plum)]/10 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="interactive absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--ink-soft)] hover:text-[var(--plum)]"
                  title={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="interactive mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--plum)] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--plum-bright)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Autenticando...
                </>
              ) : (
                <>
                  Entrar no Painel <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Rodapé Informativo */}
          <div className="border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--ink-soft)]">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--gold)]" />
              Ambiente protegido com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
