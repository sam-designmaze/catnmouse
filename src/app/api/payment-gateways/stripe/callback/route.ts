import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `/settings?error=oauth_error&message=Missing%20code%20or%20state`
    );
  }

  let tenantId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    tenantId = decoded.tenantId;
  } catch {
    return NextResponse.redirect(
      `/settings?error=invalid_state&message=Invalid%20state%20parameter`
    );
  }

  try {
    const stripeClientId = process.env.STRIPE_OAUTH_CLIENT_ID;
    const stripeClientSecret = process.env.STRIPE_OAUTH_CLIENT_SECRET;

    if (!stripeClientId || !stripeClientSecret) {
      throw new Error("Stripe OAuth not configured");
    }

    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: stripeClientId,
        client_secret: stripeClientSecret,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "OAuth token exchange failed");
    }

    await prisma.paymentGateway.upsert({
      where: { tenantId_provider: { tenantId, provider: "stripe" } },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || undefined,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : null,
        active: true,
      },
      create: {
        tenantId,
        provider: "stripe",
        accessToken: data.access_token,
        refreshToken: data.refresh_token || "",
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : null,
      },
    });

    return NextResponse.redirect(
      `/settings?success=Stripe%20connected%20successfully`
    );
  } catch (error: any) {
    return NextResponse.redirect(
      `/settings?error=connection_failed&message=${encodeURIComponent(
        error.message
      )}`
    );
  }
}
