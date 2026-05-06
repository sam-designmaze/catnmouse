import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentLink } from "@/lib/stripe";
import { sendInvoiceNotification } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already has a payment link
    if (invoice.stripePaymentLinkId) {
      return NextResponse.json({
        url: `https://pay.stripe.com/pl/${invoice.stripePaymentLinkId}`,
      });
    }

    // Create payment link
    const paymentLink = await createPaymentLink(
      invoice.amount,
      "usd",
      `Invoice ${invoice.invoiceNumber}`,
      {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        clientName: invoice.client.name,
      }
    );

    // Update invoice with payment link
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { stripePaymentLinkId: paymentLink.id },
      include: { tenant: true },
    });

    // Send invoice notification email to client
    await sendInvoiceNotification(
      invoice.client.email,
      invoice.invoiceNumber,
      invoice.amount,
      invoice.dueDate.toISOString(),
      paymentLink.url || "",
      updatedInvoice.tenant.name
    );

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error("Payment link error:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
