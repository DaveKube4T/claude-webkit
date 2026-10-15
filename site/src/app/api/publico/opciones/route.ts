import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabaseAdmin.from("compras").select("lider");

  const colaboradores = Array.from(
    new Set((data ?? []).map((c) => c.lider).filter(Boolean))
  ).sort();

  return NextResponse.json({ colaboradores });
}
