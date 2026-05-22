import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("centres").select("id, name, state, url").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, state, url } = await req.json();
  if (!id || !name || !state) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase.from("centres").insert({ id, name, state, url: url || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, state, url } = await req.json();
  if (!id || !name || !state) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase.from("centres").update({ name, state, url: url || null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase.from("centres").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
