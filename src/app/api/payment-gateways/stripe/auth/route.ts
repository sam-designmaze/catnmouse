import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

function requireTenant(session: any): string | null {
  if (!session || !session.user?.tenantId) return null;
  return session.user.tenantId;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeClientId = process.env.STRIPE_OAUTH_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/payment-gateways/stripe/callback`;

  if (!stripeClientId) {
    return NextResponse.json(
      { error: "Stripe OAuth not configured" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ tenantId })).toString("base64");

  const authUrl = new URL("https://connect.stripe.com/oauth/authorize");
  authUrl.searchParams.set("client_id", stripeClientId);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("stripe_user[url]", process.env.NEXTAUTH_URL || "http://localhost:3000");
  authUrl.searchParams.set("stripe_user[stripe_user_type]", "express");

  return NextResponse.redirect(authUrl.toString());
}
