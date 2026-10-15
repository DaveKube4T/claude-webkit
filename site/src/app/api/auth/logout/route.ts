import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-session-token");
  if (token) {
    await supabaseAdmin.from("sesiones").delete().eq("token", token);
  }
  return NextResponse.json({ ok: true });
}
