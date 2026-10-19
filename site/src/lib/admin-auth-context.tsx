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

const TOKEN_KEY = "resonancia_admin_token";

interface AdminUser {
  nombre: string;
  usuario: string;
  rol: "superadmin" | "admin" | "verificador";
  paquetesAsignados: string[];
}

interface AdminAuthState {
  usuario: AdminUser | null;
  cargando: boolean;
  login: (usuario: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AdminUser | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAutenticado = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = localStorage.getItem(TOKEN_KEY);
      return fetch(input, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          "x-session-token": token ?? "",
        },
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
    setUsuario(null);
    router.push("/admin/login");
  }, [router]);

  const login = useCallback(async (usuarioInput: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuarioInput, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "No se pudo iniciar sesión.";

    localStorage.setItem(TOKEN_KEY, data.token);
    setUsuario({
      nombre: data.nombre,
      usuario: usuarioInput,
      rol: data.rol,
      paquetesAsignados: data.paquetesAsignados ?? [],
    });
    router.replace("/admin");
    return null;
  }, [router]);

  useEffect(() => {
    let activo = true;
    async function verificar() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setCargando(false);
        if (pathname !== "/admin/login") router.replace("/admin/login");
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { "x-session-token": token },
      });
      if (!activo) return;
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setCargando(false);
        if (pathname !== "/admin/login") router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setUsuario({
        nombre: data.nombre,
        usuario: data.usuario,
        rol: data.rol,
        paquetesAsignados: data.paquetesAsignados ?? [],
      });
      setCargando(false);
      if (pathname === "/admin/login") router.replace("/admin");
    }
    verificar();
    return () => {
      activo = false;
    };
  }, [pathname, router]);

  return (
    <AdminAuthContext.Provider
      value={{ usuario, cargando, login, logout, fetchAutenticado }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
  return ctx;
}
