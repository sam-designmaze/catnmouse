import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";

export async function GET() {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return NextResponse.json({ token });
}
