import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Platform Admins ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("password", 10);

  const adminOwner = await prisma.admin.upsert({
    where: { email: "admin@wayfront.com" },
    update: {},
    create: { email: "admin@wayfront.com", password: adminPassword, name: "Alex Admin", role: "OWNER" },
  });

  await prisma.admin.upsert({
    where: { email: "support@wayfront.com" },
    update: {},
    create: { email: "support@wayfront.com", password: adminPassword, name: "Sam Support", role: "SUPPORT" },
  });

  console.log("✅ Admins created");

  // ─── Tenants ────────────────────────────────────────────────────────────────
  const tenantsData = [
    {
      name: "Domains Highway",
      subdomain: "domainshighway",
      primaryColor: "#22c55e",
      plan: "PRO" as const,
      monthlyRate: 199,
      userEmail: "admin@domainshighway.com",
    },
    {
      name: "WebFlow Agency",
      subdomain: "webflow",
      primaryColor: "#06b6d4",
      plan: "STARTER" as const,
      monthlyRate: 99,
      userEmail: "admin@webflowagency.com",
    },
    {
      name: "SaaS Accelerator",
      subdomain: "saasaccel",
      primaryColor: "#a78bfa",
      plan: "ENTERPRISE" as const,
      monthlyRate: 499,
      userEmail: "admin@saasaccel.com",
    },
  ];

  for (const td of tenantsData) {
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: td.subdomain },
      update: {},
      create: {
        name: td.name,
        subdomain: td.subdomain,
        primaryColor: td.primaryColor,
        platformName: "Wayfront",
        status: "ACTIVE",
        billing: {
          create: {
            plan: td.plan,
            monthlyRate: td.monthlyRate,
            status: "ACTIVE",
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // Owner user
    const userPassword = await bcrypt.hash("password", 10);
    const user = await prisma.user.upsert({
      where: { email_tenantId: { email: td.userEmail, tenantId: tenant.id } },
      update: {},
      create: { email: td.userEmail, password: userPassword, name: `${td.name} Admin`, role: "OWNER", tenantId: tenant.id },
    });

    // Services
    const services = await Promise.all([
      prisma.service.upsert({
        where: { id: `service-${tenant.subdomain}-1` },
        update: {},
        create: { id: `service-${tenant.subdomain}-1`, name: "Domain Registration", description: "Register new domains", price: 12.99, tenantId: tenant.id },
      }),
      prisma.service.upsert({
        where: { id: `service-${tenant.subdomain}-2` },
        update: {},
        create: { id: `service-${tenant.subdomain}-2`, name: "SSL Certificate", description: "Secure your website", price: 49.0, tenantId: tenant.id },
      }),
      prisma.service.upsert({
        where: { id: `service-${tenant.subdomain}-3` },
        update: {},
        create: { id: `service-${tenant.subdomain}-3`, name: "Web Hosting", description: "Fast and reliable hosting", price: 19.99, tenantId: tenant.id },
      }),
    ]);

    // Clients
    const clientNames = [
      ["Alice Johnson", "alice@example.com", "+1 555-0101"],
      ["Bob Martinez", "bob@example.com", "+1 555-0102"],
      ["Carol Williams", "carol@example.com", "+1 555-0103"],
      ["David Lee", "david@example.com", "+1 555-0104"],
      ["Eva Brown", "eva@example.com", "+1 555-0105"],
    ];

    const clients = [];
    for (let i = 0; i < clientNames.length; i++) {
      const [cname, cemail, cphone] = clientNames[i];
      const client = await prisma.client.upsert({
        where: { id: `client-${tenant.subdomain}-${i + 1}` },
        update: {},
        create: {
          id: `client-${tenant.subdomain}-${i + 1}`,
          name: cname,
          email: cemail,
          phone: cphone,
          status: i < 4 ? "ACTIVE" : "INACTIVE",
          tenantId: tenant.id,
        },
      });
      clients.push(client);
    }

    // Orders
    const orderStatuses = ["COMPLETED", "PROCESSING", "PENDING", "COMPLETED", "CANCELLED", "COMPLETED", "PROCESSING", "PENDING", "COMPLETED", "CANCELLED"];
    for (let i = 0; i < 10; i++) {
      await prisma.order.upsert({
        where: { id: `order-${tenant.subdomain}-${i + 1}` },
        update: {},
        create: {
          id: `order-${tenant.subdomain}-${i + 1}`,
          orderNumber: `ORD-${String(1000 + i).padStart(4, "0")}`,
          clientId: clients[i % clients.length].id,
          tenantId: tenant.id,
          status: orderStatuses[i] as "COMPLETED" | "PROCESSING" | "PENDING" | "CANCELLED",
          totalAmount: [12.99, 49.0, 19.99, 99.0, 149.99][i % 5],
          serviceId: services[i % services.length].id,
        },
      });
    }

    // Invoices
    const invoiceStatuses = ["PAID", "SENT", "OVERDUE", "DRAFT", "PAID"];
    for (let i = 0; i < 5; i++) {
      await prisma.invoice.upsert({
        where: { id: `invoice-${tenant.subdomain}-${i + 1}` },
        update: {},
        create: {
          id: `invoice-${tenant.subdomain}-${i + 1}`,
          invoiceNumber: `INV-${String(2000 + i).padStart(4, "0")}`,
          clientId: clients[i % clients.length].id,
          tenantId: tenant.id,
          status: invoiceStatuses[i] as "PAID" | "SENT" | "OVERDUE" | "DRAFT",
          amount: [199.0, 399.0, 99.0, 599.0, 149.0][i],
          dueDate: new Date(Date.now() + (i - 2) * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Subscriptions
    const subPlans = [
      { name: "Starter Plan", price: 29, interval: "MONTHLY" as const, status: "ACTIVE" as const },
      { name: "Pro Plan", price: 79, interval: "MONTHLY" as const, status: "ACTIVE" as const },
      { name: "Enterprise Plan", price: 199, interval: "YEARLY" as const, status: "TRIAL" as const },
    ];
    for (let i = 0; i < 3; i++) {
      await prisma.subscription.upsert({
        where: { id: `sub-${tenant.subdomain}-${i + 1}` },
        update: {},
        create: { id: `sub-${tenant.subdomain}-${i + 1}`, ...subPlans[i], tenantId: tenant.id },
      });
    }

    // Coupons
    await prisma.coupon.upsert({
      where: { code_tenantId: { code: "WELCOME10", tenantId: tenant.id } },
      update: {},
      create: { code: "WELCOME10", discount: 10, type: "PERCENTAGE", usageLimit: 100, usageCount: 23, active: true, tenantId: tenant.id },
    });
    await prisma.coupon.upsert({
      where: { code_tenantId: { code: "SUMMER20", tenantId: tenant.id } },
      update: {},
      create: { code: "SUMMER20", discount: 20, type: "PERCENTAGE", usageLimit: 50, usageCount: 8, active: true, tenantId: tenant.id, expiresAt: new Date("2026-08-31") },
    });
    await prisma.coupon.upsert({
      where: { code_tenantId: { code: "VIP50", tenantId: tenant.id } },
      update: {},
      create: { code: "VIP50", discount: 50, type: "PERCENTAGE", usageLimit: 10, usageCount: 3, active: false, tenantId: tenant.id },
    });

    // Referrals
    const referralStatuses = ["CONVERTED", "PENDING", "REWARDED"] as const;
    for (let i = 0; i < 3; i++) {
      await prisma.referral.upsert({
        where: { code: `REF-${tenant.subdomain.toUpperCase()}-${String(i + 1).padStart(3, "0")}` },
        update: {},
        create: {
          code: `REF-${tenant.subdomain.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
          referrerEmail: clients[i % clients.length].email,
          refereeEmail: i > 0 ? `referred${i}@example.com` : null,
          status: referralStatuses[i],
          reward: [25, 0, 25][i],
          tenantId: tenant.id,
        },
      });
    }

    // Forms
    await prisma.form.upsert({
      where: { id: `form-${tenant.subdomain}-1` },
      update: {},
      create: {
        id: `form-${tenant.subdomain}-1`,
        name: "Domain Transfer Request",
        fields: JSON.stringify([
          { label: "Domain name", type: "text", required: true },
          { label: "Current registrar", type: "text", required: true },
          { label: "Auth code", type: "text", required: true },
        ]),
        active: true,
        tenantId: tenant.id,
      },
    });
    await prisma.form.upsert({
      where: { id: `form-${tenant.subdomain}-2` },
      update: {},
      create: {
        id: `form-${tenant.subdomain}-2`,
        name: "Support Ticket",
        fields: JSON.stringify([
          { label: "Subject", type: "text", required: true },
          { label: "Priority", type: "select", required: true },
          { label: "Description", type: "textarea", required: true },
        ]),
        active: true,
        tenantId: tenant.id,
      },
    });

    // Analytics snapshot
    const currentMonth = new Date().toISOString().slice(0, 7);
    await prisma.tenantAnalytics.upsert({
      where: { tenantId_month: { tenantId: tenant.id, month: currentMonth } },
      update: {},
      create: {
        tenantId: tenant.id,
        month: currentMonth,
        activeUsers: 1,
        ordersCount: 10,
        invoicesCount: 5,
        revenue: 1245.0,
      },
    });

    console.log(`  ✅ ${tenant.name} (${tenant.subdomain}): seeded`);
  }

  console.log("\n🎉 Seeding complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Login credentials:");
  console.log("   Platform Admin:  admin@wayfront.com / password");
  console.log("   Domains Highway: admin@domainshighway.com / password");
  console.log("   WebFlow Agency:  admin@webflowagency.com / password");
  console.log("   SaaS Accelerator: admin@saasaccel.com / password");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
