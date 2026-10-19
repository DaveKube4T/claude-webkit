import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jotformApiKey = process.env.JOTFORM_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !jotformApiKey) {
  console.error("Faltan variables de entorno (Supabase URL, Service Key o Jotform API Key)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function idDePersona(telegram) {
  return createHash("sha1").update(`personas:${telegram.toLowerCase()}`).digest("hex");
}

async function main() {
  console.log("Obteniendo registros de JotForm para Armado de la Sociedad Anónima (Form ID: 260655815763667)...");
  const res = await fetch(`https://api.jotform.com/form/260655815763667/submissions?apiKey=${jotformApiKey}&limit=200`);
  const data = await res.json();
  const submissions = data.content || [];
  console.log(`Se encontraron ${submissions.length} registros en JotForm.`);

  for (const sub of submissions) {
    const ans = sub.answers;
    const nombre = ans["3"]?.prettyFormat || [ans["3"]?.answer?.first, ans["3"]?.answer?.last].filter(Boolean).join(" ") || "Sin nombre";
    const mail = (ans["4"]?.answer || "").trim().toLowerCase();
    const telegramRaw = ans["13"]?.answer || "";
    const telegram = telegramRaw.replace(/^@/, "").trim();
    const hash = ans["26"]?.answer || null;
    const files = ans["10"]?.answer;
    const comprobanteUrl = Array.isArray(files) ? files[0] : (typeof files === "string" ? files : null);
    const createdAt = sub.created_at || new Date().toISOString();

    if (!telegram) {
      console.log(`[AVISO] Submisión ${sub.id} no tiene Telegram. Saltando...`);
      continue;
    }

    const personaId = idDePersona(telegram);
    console.log(`Procesando: ${nombre} (@${telegram})`);

    // 1. Upsert persona
    const { data: personaExistente } = await supabase
      .from("personas")
      .select("id, mail")
      .eq("id", personaId)
      .maybeSingle();

    if (!personaExistente) {
      const defaultPassword = await bcrypt.hash("Resonancia2026*", 12);
      const { error: errPersona } = await supabase.from("personas").insert({
        id: personaId,
        nombre,
        mail: mail || null,
        telegram,
        password_hash: defaultPassword,
        creada_en: createdAt,
      });
      if (errPersona) {
        console.error(`  Error creando persona ${telegram}:`, errPersona.message);
        continue;
      }
    } else if (mail) {
      if (!personaExistente.mail) {
        await supabase.from("personas").update({ mail }).eq("id", personaId);
      } else if (personaExistente.mail !== mail) {
        await supabase.from("personas").update({ mail_alternativo: mail }).eq("id", personaId);
      }
    }

    // 2. Verificar si ya existe compra para este paquete
    const paqueteNombre = "Armado de S.A. + Llave de Acceso de regalo";
    const { data: compraExistente } = await supabase
      .from("compras")
      .select("id")
      .eq("persona_id", personaId)
      .eq("paquete", paqueteNombre)
      .maybeSingle();

    const vouchers = comprobanteUrl ? [{ url: comprobanteUrl, fecha: createdAt }] : [];

    if (!compraExistente) {
      const { error: errCompra } = await supabase.from("compras").insert({
        persona_id: personaId,
        persona_nombre: nombre,
        persona_telegram: telegram,
        paquete: paqueteNombre,
        lider: null,
        participaciones: 1,
        hash: hash || null,
        estado: "verificada",
        vouchers,
        voucher_url: comprobanteUrl || null,
        creada_en: createdAt,
      });
      if (errCompra) {
        console.error(`  Error creando compra para ${telegram}:`, errCompra.message);
      } else {
        console.log(`  Compra de "${paqueteNombre}" registrada y verificada.`);
      }
    } else {
      console.log(`  La compra de "${paqueteNombre}" ya existía. Actualizando datos...`);
      await supabase.from("compras").update({
        persona_nombre: nombre,
        persona_telegram: telegram,
        hash: hash || null,
        estado: "verificada",
        vouchers,
        voucher_url: comprobanteUrl || null,
      }).eq("id", compraExistente.id);
    }
  }

  console.log("¡Migración de Armado de Sociedades Anónimas completada con éxito!");
}

main().catch(console.error);
