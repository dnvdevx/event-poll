import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { ADMIN_PASSWORD } from "@/lib/auth";

export async function POST(req) {
  const { password } = await req.json();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const attemptsKey = `login_attempts:${ip}`;

  const attempts = Number((await redis.get(attemptsKey)) || 0);
  if (attempts >= 5) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  if (password === ADMIN_PASSWORD) {
    await redis.del(attemptsKey);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_auth", ADMIN_PASSWORD, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  }

  await redis.incr(attemptsKey);
  await redis.expire(attemptsKey, 60 * 15);

  return NextResponse.json({ ok: false }, { status: 401 });
}