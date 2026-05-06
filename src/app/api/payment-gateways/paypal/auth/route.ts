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

  const paypalClientId = process.env.PAYPAL_OAUTH_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/payment-gateways/paypal/callback`;

  if (!paypalClientId) {
    return NextResponse.json(
      { error: "PayPal OAuth not configured" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ tenantId })).toString("base64");

  const authUrl = new URL("https://www.sandbox.paypal.com/signin/authorize");
  authUrl.searchParams.set("client_id", paypalClientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email https://api.paypal.com/v1/billing/subscriptions.write");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
