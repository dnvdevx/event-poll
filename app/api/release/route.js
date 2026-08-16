import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isAdmin } from "@/lib/auth";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();

  const prevActive = await redis.get("poll:active");
  if (prevActive) {
    await redis.hset(`poll:question:${prevActive}`, { status: "ended" });
  }

  if (id) {
    await redis.set("poll:active", id);
    await redis.hset(`poll:question:${id}`, { status: "active" });
  } else {
    await redis.del("poll:active");
  }

  return NextResponse.json({ ok: true });
}