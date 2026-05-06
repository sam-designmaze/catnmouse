import { prisma } from "./prisma";

export type WebhookEvent =
  | "order.created"
  | "order.updated"
  | "invoice.created"
  | "invoice.paid"
  | "client.created"
  | "client.deleted";

export async function triggerWebhook(
  tenantId: string,
  event: WebhookEvent,
  data: Record<string, any>
) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        tenantId,
        active: true,
      },
    });

    for (const webhook of webhooks) {
      // Queue webhook delivery
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": generateSignature(webhook.secret, data),
          "X-Webhook-Event": event,
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data,
        }),
      }).catch((error) => {
        console.error(`Webhook delivery failed for ${webhook.id}:`, error);
      });
    }
  } catch (error) {
    console.error("Webhook trigger error:", error);
  }
}

function generateSignature(secret: string, data: Record<string, any>): string {
  const crypto = require("crypto");
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(data))
    .digest("hex");
}
