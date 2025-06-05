import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'TechCorp Solutions',
      subdomain: 'techcorp',
      plan: 'pro',
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'MarketingPro Inc',
      subdomain: 'marketingpro',
      plan: 'enterprise',
    },
  });

  console.log('✅ Created tenants');

  // Create users for tenant1
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser1 = await prisma.user.create({
    data: {
      email: 'admin@techcorp.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Admin',
      role: 'ADMIN',
      tenantId: tenant1.id,
    },
  });

  const salesUser1 = await prisma.user.create({
    data: {
      email: 'sales@techcorp.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Sales',
      role: 'USER',
      tenantId: tenant1.id,
    },
  });

  // Create users for tenant2
  const adminUser2 = await prisma.user.create({
    data: {
      email: 'admin@marketingpro.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Manager',
      role: 'ADMIN',
      tenantId: tenant2.id,
    },
  });

  console.log('✅ Created users');

  // Create companies for tenant1
  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Corporation',
      industry: 'Technology',
      website: 'https://acme.com',
      email: 'info@acme.com',
      phone: '+1-555-0123',
      size: 'LARGE',
      status: 'ACTIVE',
      tenantId: tenant1.id,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'StartupXYZ',
      industry: 'Software',
      website: 'https://startupxyz.com',
      email: 'hello@startupxyz.com',
      size: 'STARTUP',
      status: 'PROSPECT',
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Created companies');

  // Create contacts for tenant1
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@acme.com',
      phone: '+1-555-0124',
      position: 'CTO',
      status: 'ACTIVE',
      companyId: company1.id,
      tenantId: tenant1.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@startupxyz.com',
      phone: '+1-555-0125',
      position: 'CEO',
      status: 'PROSPECT',
      companyId: company2.id,
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Created contacts');

  // Create deals for tenant1
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Enterprise Software License',
      value: 50000,
      currency: 'USD',
      stage: 'PROPOSAL',
      status: 'OPEN',
      probability: 75,
      closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      companyId: company1.id,
      contactId: contact1.id,
      ownerId: salesUser1.id,
      tenantId: tenant1.id,
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: 'Startup Package',
      value: 10000,
      currency: 'USD',
      stage: 'QUALIFICATION',
      status: 'OPEN',
      probability: 50,
      closeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      companyId: company2.id,
      contactId: contact2.id,
      ownerId: salesUser1.id,
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Created deals');

  // Create activities for tenant1
  await prisma.activity.create({
    data: {
      title: 'Follow-up call with Alice',
      description: 'Discuss proposal details and timeline',
      type: 'CALL',
      status: 'PLANNED',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      assignedToId: salesUser1.id,
      companyId: company1.id,
      contactId: contact1.id,
      dealId: deal1.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.activity.create({
    data: {
      title: 'Send proposal document',
      description: 'Email the detailed proposal to Bob',
      type: 'EMAIL',
      status: 'COMPLETED',
      completedAt: new Date(),
      assignedToId: salesUser1.id,
      companyId: company2.id,
      contactId: contact2.id,
      dealId: deal2.id,
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Created activities');

  // Create notes for tenant1
  await prisma.note.create({
    data: {
      content:
        'Alice showed great interest in our enterprise features. She mentioned they are looking to expand their team next quarter.',
      authorId: salesUser1.id,
      companyId: company1.id,
      contactId: contact1.id,
      dealId: deal1.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.note.create({
    data: {
      content:
        'Bob is price-sensitive but very interested in the product. May need to offer a discount for startups.',
      authorId: salesUser1.id,
      companyId: company2.id,
      contactId: contact2.id,
      dealId: deal2.id,
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Created notes');

  // Create some data for tenant2 as well
  const company3 = await prisma.company.create({
    data: {
      name: 'RetailCorp',
      industry: 'Retail',
      website: 'https://retailcorp.com',
      size: 'MEDIUM',
      status: 'ACTIVE',
      tenantId: tenant2.id,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol@retailcorp.com',
      position: 'Marketing Director',
      status: 'ACTIVE',
      companyId: company3.id,
      tenantId: tenant2.id,
    },
  });

  console.log('✅ Created data for tenant2');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
