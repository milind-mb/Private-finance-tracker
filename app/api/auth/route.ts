import { NextRequest, NextResponse } from "next/server";

const COOKIE = "ft_auth";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.SITE_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, password, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return res;
}
