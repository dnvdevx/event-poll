import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { parseChoices } from "@/lib/poll";

export async function GET() {
  const activeId = await redis.get("poll:active");
  if (!activeId) return NextResponse.json({ active: null });

  const q = await redis.hgetall(`poll:question:${activeId}`);
  if (!q || !q.text) return NextResponse.json({ active: null });

  const cookieStore = await cookies();
  const votedChoice = cookieStore.get(`voted_${activeId}`)?.value || null;

  return NextResponse.json({
    active: {
      id: activeId,
      text: q.text,
      choices: parseChoices(q),
      eventName: q.eventName || "",
    },
    votedChoice,
  });
}

export async function POST(req) {
  const { id, choice } = await req.json();

  const cookieStore = await cookies();
  const already = cookieStore.get(`voted_${id}`);
  if (already) {
    return NextResponse.json({ error: "already voted" }, { status: 400 });
  }

  const activeId = await redis.get("poll:active");
  if (String(activeId) !== String(id)) {
    return NextResponse.json({ error: "question not active" }, { status: 400 });
  }

  await redis.hincrby(`poll:votes:${id}`, `choice${choice}`, 1);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`voted_${id}`, String(choice), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, 
  });
  return res;
}