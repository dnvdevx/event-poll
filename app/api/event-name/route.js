import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const eventName = (await redis.get("poll:event_name")) || "";
  return NextResponse.json({ eventName });
}

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { eventName } = await req.json();
  await redis.set("poll:event_name", eventName || "");
  return NextResponse.json({ ok: true });
}