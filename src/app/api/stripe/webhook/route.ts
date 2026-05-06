import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmation } from "@/lib/email";

const PLAN_RATES: Record<string, number> = {
  STARTER: 99,
  PRO: 199,
  ENTERPRISE: 499,
};

export async function POST(request: NextRequest) {
  const body = await request.arrayBuffer();
  const sig = request.headers.get("stripe-signature") || "";

  try {
    const event = constructWebhookEvent(
      Buffer.from(body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan;

        if (tenantId && plan) {
          // Calculate next billing date (30 days from now)
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 30);

          await prisma.tenantBilling.update({
            where: { tenantId },
            data: {
              plan,
              monthlyRate: PLAN_RATES[plan as keyof typeof PLAN_RATES] || 99,
              stripeSubscriptionId: session.subscription,
              status: "ACTIVE",
              nextBillingDate,
              lastPaymentDate: new Date(),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;

        if (tenantId) {
          await prisma.tenantBilling.update({
            where: { tenantId },
            data: {
              stripeSubscriptionId: subscription.id,
              status: subscription.cancel_at_period_end
                ? "CANCELLED"
                : "ACTIVE",
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const tenantId = invoice.metadata?.tenantId;
        const invoiceId = invoice.metadata?.invoiceId;

        if (tenantId && invoiceId) {
          const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
            include: { client: true, tenant: true },
          });

          // Update tenant billing last payment date
          await prisma.tenantBilling.update({
            where: { tenantId },
            data: { lastPaymentDate: new Date() },
          });

          // Send payment confirmation email
          await sendPaymentConfirmation(
            updatedInvoice.client.email,
            updatedInvoice.invoiceNumber,
            updatedInvoice.amount,
            updatedInvoice.tenant.name
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "OVERDUE" },
          });
        }
        break;
      }

      case "payment_link.created": {
        // Track payment links if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 400 }
    );
  }
}
