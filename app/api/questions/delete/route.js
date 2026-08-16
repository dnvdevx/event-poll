import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isAdmin } from "@/lib/auth";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const activeId = await redis.get("poll:active");
  if (activeId === id) {
    return NextResponse.json({ error: "cannot delete active question" }, { status: 400 });
  }

  await redis.del(`poll:question:${id}`);
  await redis.del(`poll:votes:${id}`);
  await redis.lrem("poll:all_ids", 0, id);

  return NextResponse.json({ ok: true });
}