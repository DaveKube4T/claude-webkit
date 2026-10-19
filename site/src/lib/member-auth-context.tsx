"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

const TOKEN_KEY = "resonancia_member_token";

interface MemberUser {
  nombre: string;
  telegram: string;
  aceptoDisclaimer: boolean;
}

interface MemberAuthState {
  miembro: MemberUser | null;
  cargando: boolean;
  login: (identificador: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
  marcarDisclaimerAceptado: () => void;
  solicitarCodigo: (
    identificador: string
  ) => Promise<
    | { ok: true; canal: "email"; mailOculto: string }
    | { ok: true; canal: "telegram" }
    | { ok: false; error: string }
  >;
  verificarCodigo: (
    identificador: string,
    codigo: string,
    nuevaPassword: string
  ) => Promise<string | null>;
}

const MemberAuthContext = createContext<MemberAuthState | null>(null);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [miembro, setMiembro] = useState<MemberUser | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAutenticado = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = localStorage.getItem(TOKEN_KEY);
      return fetch(input, {
        ...init,
        headers: { ...(init.headers ?? {}), "x-session-token": token ?? "" },
      });
    },
    []
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-session-token": token },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setMiembro(null);
    router.push("/");
  }, [router]);

  const login = useCallback(async (identificador: string, password: string) => {
    const res = await fetch("/api/auth/member-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificador, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.codigo === "SIN_PASSWORD") return "SIN_PASSWORD";
      return data.error ?? "No se pudo iniciar sesión.";
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    const aceptoDisclaimer = Boolean(data.aceptoDisclaimer);
    setMiembro({ nombre: data.nombre, telegram: identificador, aceptoDisclaimer });
    router.push(aceptoDisclaimer ? "/miembro" : "/miembro/aceptar");
    return null;
  }, [router]);

  const solicitarCodigo = useCallback(async (identificador: string) => {
    const res = await fetch("/api/auth/member-login/codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificador }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false as const, error: data.error ?? "No pudimos enviar el código." };
    }
    if (data.canal === "telegram") {
      return { ok: true as const, canal: "telegram" as const };
    }
    return {
      ok: true as const,
      canal: "email" as const,
      mailOculto: data.mailOculto as string,
    };
  }, []);

  const verificarCodigo = useCallback(
    async (identificador: string, codigo: string, nuevaPassword: string) => {
      const res = await fetch("/api/auth/member-login/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, codigo, nuevaPassword }),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "No pudimos verificar el código.";

      localStorage.setItem(TOKEN_KEY, data.token);
      const aceptoDisclaimer = Boolean(data.aceptoDisclaimer);
      setMiembro({ nombre: data.nombre, telegram: identificador, aceptoDisclaimer });
      router.push(aceptoDisclaimer ? "/miembro" : "/miembro/aceptar");
      return null;
    },
    [router]
  );

  const marcarDisclaimerAceptado = useCallback(() => {
    setMiembro((m) => (m ? { ...m, aceptoDisclaimer: true } : m));
  }, []);

  useEffect(() => {
    let activo = true;
    async function verificar() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setCargando(false);
        if (pathname.startsWith("/miembro")) router.replace("/");
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { "x-session-token": token },
      });
      if (!activo) return;
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setCargando(false);
        if (pathname.startsWith("/miembro")) router.replace("/");
        return;
      }
      const data = await res.json();
      const aceptoDisclaimer = Boolean(data.aceptoDisclaimer);
      setMiembro({ nombre: data.nombre, telegram: data.usuario, aceptoDisclaimer });
      setCargando(false);
      if (!aceptoDisclaimer && pathname.startsWith("/miembro") && pathname !== "/miembro/aceptar") {
        router.replace("/miembro/aceptar");
      }
    }
    verificar();
    return () => {
      activo = false;
    };
  }, [pathname, router]);

  return (
    <MemberAuthContext.Provider
      value={{
        miembro,
        cargando,
        login,
        logout,
        fetchAutenticado,
        marcarDisclaimerAceptado,
        solicitarCodigo,
        verificarCodigo,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth debe usarse dentro de MemberAuthProvider");
  return ctx;
}
