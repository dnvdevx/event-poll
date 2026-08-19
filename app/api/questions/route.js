import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isAdmin } from "@/lib/auth";
import { MIN_CHOICES, MAX_CHOICES } from "@/lib/poll";


export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ids = await redis.lrange("poll:all_ids", 0, -1);
  const questions = [];
  for (const id of ids) {
    const q = await redis.hgetall(`poll:question:${id}`);
    if (q) questions.push({ id, ...q });
  }
  return NextResponse.json({ questions });
}

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { text, choices } = await req.json();

  if (!text || !choices || choices.length < MIN_CHOICES || choices.length > MAX_CHOICES) {
    return NextResponse.json(
      { error: `need text and ${MIN_CHOICES}-${MAX_CHOICES} choices` },
      { status: 400 }
    );
  }

  const id = Date.now().toString();

  await redis.hset(`poll:question:${id}`, {
    text,
    choices: JSON.stringify(choices),
    status: "queued",
  });

  await redis.rpush("poll:all_ids", id);

  return NextResponse.json({ ok: true, id });
}