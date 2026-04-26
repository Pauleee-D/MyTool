import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("email_templates").select("centre_id, template");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: Record<string, string> = {};
  for (const row of data ?? []) result[row.centre_id] = row.template;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, template } = await req.json();
  if (!id || typeof template !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = getSupabase();
  await supabase.from("email_templates").delete().eq("centre_id", id);
  const { error } = await supabase.from("email_templates").insert({ centre_id: id, template });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
