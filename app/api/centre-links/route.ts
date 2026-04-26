import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("centre_links").select("centre_id, website_url, knowledge_url");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: Record<string, { website_url?: string; knowledge_url?: string }> = {};
  for (const row of data ?? []) result[row.centre_id] = { website_url: row.website_url, knowledge_url: row.knowledge_url };
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, website_url, knowledge_url } = await req.json();
  if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = getSupabase();
  const existing = await supabase.from("centre_links").select("centre_id").eq("centre_id", id).single();

  if (existing.data) {
    const { error } = await supabase.from("centre_links").update({ website_url, knowledge_url }).eq("centre_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from("centre_links").insert({ centre_id: id, website_url, knowledge_url });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
