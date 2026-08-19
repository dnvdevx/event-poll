import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { parseChoices } from "@/lib/poll";

export async function GET() {
  const activeId = await redis.get("poll:active");

  if (!activeId) {
    return NextResponse.json({ active: null });
  }

  const q = await redis.hgetall(`poll:question:${activeId}`);
  if (!q || !q.text) {
    return NextResponse.json({ active: null });
  }

  const votes = await redis.hgetall(`poll:votes:${activeId}`);
  const choices = parseChoices(q);

  const counts = choices.map((_, i) => Number(votes?.[`choice${i + 1}`] || 0));
  const total = counts.reduce((a, b) => a + b, 0);

  return NextResponse.json({
    active: {
      id: activeId,
      text: q.text,
      choices,
      counts,
      total,
      eventName: q.eventName || "",
    },
  });
}