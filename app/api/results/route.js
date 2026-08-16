import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

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

  const counts = [1, 2, 3, 4].map((n) => Number(votes?.[`choice${n}`] || 0));
  const total = counts.reduce((a, b) => a + b, 0);

  return NextResponse.json({
    active: {
      id: activeId,
      text: q.text,
      choices: [q.choice1, q.choice2, q.choice3, q.choice4],
      counts,
      total,
      eventName: q.eventName || "",
    },
  });
}