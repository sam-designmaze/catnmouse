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
    const paypalClientId = process.env.PAYPAL_OAUTH_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_OAUTH_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/payment-gateways/paypal/callback`;

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal OAuth not configured");
    }

    const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64");

    const response = await fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || "OAuth token exchange failed");
    }

    await prisma.paymentGateway.upsert({
      where: { tenantId_provider: { tenantId, provider: "paypal" } },
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
        provider: "paypal",
        accessToken: data.access_token,
        refreshToken: data.refresh_token || "",
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : null,
      },
    });

    return NextResponse.redirect(
      `/settings?success=PayPal%20connected%20successfully`
    );
  } catch (error: any) {
    return NextResponse.redirect(
      `/settings?error=connection_failed&message=${encodeURIComponent(
        error.message
      )}`
    );
  }
}
