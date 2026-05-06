import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, createCheckoutSession } from "@/lib/stripe";

const PLAN_PRICES: Record<string, { name: string; priceId: string; rate: number }> = {
  STARTER: {
    name: "Starter",
    priceId: "price_starter_monthly", // Replace with actual Stripe price ID
    rate: 99,
  },
  PRO: {
    name: "Professional",
    priceId: "price_pro_monthly", // Replace with actual Stripe price ID
    rate: 199,
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: "price_enterprise_monthly", // Replace with actual Stripe price ID
    rate: 499,
  },
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.accountType !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { plan, tenantId } = body;

  if (!plan || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
  }

  try {
    // Get tenant and billing info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billing: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const billing = tenant.billing;

    if (!billing) {
      return NextResponse.json(
        { error: "Billing not configured" },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      tenant.id,
      tenant.name,
      "", // TODO: Get tenant admin email from first user
      billing.stripeCustomerId
    );

    // Update customer ID in database if new
    if (!billing.stripeCustomerId) {
      await prisma.tenantBilling.update({
        where: { tenantId: tenant.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create checkout session with metadata
    const baseUrl = new URL(request.url).origin;
    const checkoutSession = await createCheckoutSession(
      customer.id,
      PLAN_PRICES[plan].priceId,
      `${baseUrl}/admin/billing/${tenant.id}?success=true`,
      `${baseUrl}/admin/billing/${tenant.id}?canceled=true`,
      {
        tenantId: tenant.id,
        plan,
      }
    );

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
