import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST uniquement : une déconnexion en GET serait déclenchable par un <img>. */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
