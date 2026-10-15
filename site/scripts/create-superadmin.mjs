// Crea (o actualiza la contraseña de) un usuario de equipo en la tabla `usuarios`.
// Se corre a mano, UNA vez por cuenta, directamente en tu terminal:
//   node scripts/create-superadmin.mjs
//
// La contraseña nunca sale de tu computadora: se tipea acá, se hashea acá,
// y solo el hash viaja a Supabase.

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";

function cargarEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("No encontré site/.env.local. Corré este script desde la carpeta site/.");
    process.exit(1);
  }
  const contenido = fs.readFileSync(envPath, "utf-8");
  for (const linea of contenido.split("\n")) {
    const match = linea.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

function preguntar(rl, texto) {
  return new Promise((resolve) => rl.question(texto, resolve));
}

function preguntarOculto(rl, texto) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(texto);
    let password = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
        return;
      }
      if (char === "") process.exit(1); // Ctrl+C
      if (char === "") {
        password = password.slice(0, -1);
        return;
      }
      password += char;
    };
    stdin.on("data", onData);
  });
}

async function main() {
  cargarEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("== Crear cuenta de equipo (superadmin / admin / verificador) ==\n");

  const nombre = await preguntar(rl, "Nombre completo: ");
  const usuario = await preguntar(rl, "Usuario (para hacer login): ");
  const rolInput = await preguntar(rl, "Rol (superadmin / admin / verificador): ");
  const rol = rolInput.trim().toLowerCase();

  if (!["superadmin", "admin", "verificador"].includes(rol)) {
    console.error("Rol inválido. Tiene que ser: superadmin, admin o verificador.");
    rl.close();
    process.exit(1);
  }

  const password = await preguntarOculto(rl, "Contraseña (no se muestra en pantalla): ");
  const passwordConfirm = await preguntarOculto(rl, "Repetí la contraseña: ");

  if (password !== passwordConfirm) {
    console.error("\nLas contraseñas no coinciden. Corré el script de nuevo.");
    rl.close();
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("\nLa contraseña tiene que tener al menos 8 caracteres.");
    rl.close();
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from("usuarios")
    .upsert(
      { nombre: nombre.trim(), usuario: usuario.trim(), password_hash, rol, paquetes_asignados: [] },
      { onConflict: "usuario" }
    );

  rl.close();

  if (error) {
    console.error("\nError guardando en Supabase:", error.message);
    process.exit(1);
  }

  console.log(`\nListo — cuenta "${usuario.trim()}" (${rol}) creada/actualizada correctamente.`);
}

main();
