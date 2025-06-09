/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
import {
  createTenantFactory,
  createUserFactory,
  createCompanyFactory,
  createContactFactory,
  createDealFactory,
  createActivityFactory,
  createNoteFactory,
} from './factories';

const prisma = new PrismaClient();

// 🎛️ CONFIGURATION - Modify these numbers as needed
const SEED_CONFIG = {
  tenants: 10,
  perTenant: {
    users: 15, // Total users per tenant (1 admin + others)
    managers: 3, // Number of managers (included in users count)
    companies: 1000, // Companies per tenant
    contactsPerCompany: 30, // Contacts per company
    deals: 500, // Deals per tenant
    activitiesPerDeal: 200, // Activities per deal
    notesPerCompany: 21, // Notes per company
    notesPerContact: 1, // Notes per contact
    notesPerDeal: 1, // Notes per deal
  },
};

async function main() {
  console.log('🌱 Starting seed with configuration:');
  console.log(`📊 Tenants: ${SEED_CONFIG.tenants}`);
  console.log(
    `📊 Per tenant: ${JSON.stringify(SEED_CONFIG.perTenant, null, 2)}`,
  );

  // Create factories
  const createTenant = createTenantFactory(prisma);
  const createUser = createUserFactory(prisma);
  const createCompany = createCompanyFactory(prisma);
  const createContact = createContactFactory(prisma);
  const createDeal = createDealFactory(prisma);
  const createActivity = createActivityFactory(prisma);
  const createNote = createNoteFactory(prisma);

  // Create tenants
  console.log('🏢 Creating tenants...');
  const tenants = await Promise.all(
    Array.from({ length: SEED_CONFIG.tenants }, () => createTenant()),
  );
  console.log(`✅ Created ${tenants.length} tenants`);

  // Seed each tenant
  for (let i = 0; i < tenants.length; i++) {
    const tenant = tenants[i];
    console.log(
      `\n🏢 Seeding tenant ${i + 1}/${tenants.length}: ${tenant.name}`,
    );

    // Create users for this tenant
    console.log('👥 Creating users...');
    const adminUser = await createUser({
      tenantId: tenant.id,
      isAdmin: true,
    });

    const managers = await Promise.all(
      Array.from({ length: SEED_CONFIG.perTenant.managers }, () =>
        createUser({
          role: 'MANAGER',
          tenantId: tenant.id,
        }),
      ),
    );

    const regularUsers = await Promise.all(
      Array.from(
        {
          length:
            SEED_CONFIG.perTenant.users - SEED_CONFIG.perTenant.managers - 1,
        },
        () =>
          createUser({
            role: 'USER',
            tenantId: tenant.id,
          }),
      ),
    );

    const allUsers = [adminUser, ...managers, ...regularUsers];
    console.log(`✅ Created ${allUsers.length} users`);

    // Create companies for this tenant
    console.log('🏢 Creating companies...');
    const companies = await Promise.all(
      Array.from({ length: SEED_CONFIG.perTenant.companies }, () =>
        createCompany({
          tenantId: tenant.id,
        }),
      ),
    );
    console.log(`✅ Created ${companies.length} companies`);

    // Create contacts for this tenant
    console.log('👤 Creating contacts...');
    const contacts = [];
    for (const company of companies) {
      const companyContacts = await Promise.all(
        Array.from({ length: SEED_CONFIG.perTenant.contactsPerCompany }, () =>
          createContact({
            tenantId: tenant.id,
            companyId: company.id,
          }),
        ),
      );
      contacts.push(...companyContacts);
    }
    console.log(`✅ Created ${contacts.length} contacts`);

    // Create deals for this tenant
    console.log('💼 Creating deals...');
    const deals = await Promise.all(
      Array.from({ length: SEED_CONFIG.perTenant.deals }, () => {
        const company = companies[Math.floor(Math.random() * companies.length)];
        const companyContacts = contacts.filter(
          (c) => c.companyId === company.id,
        );
        const contact =
          companyContacts[Math.floor(Math.random() * companyContacts.length)];
        const owner = allUsers[Math.floor(Math.random() * allUsers.length)];

        return createDeal({
          tenantId: tenant.id,
          ownerId: owner.id,
          companyId: company.id,
          contactId: contact?.id,
        });
      }),
    );
    console.log(`✅ Created ${deals.length} deals`);

    // Create activities for this tenant
    console.log('📅 Creating activities...');
    const activities = [];
    for (const deal of deals) {
      const dealActivities = await Promise.all(
        Array.from({ length: SEED_CONFIG.perTenant.activitiesPerDeal }, () => {
          const assignedTo =
            allUsers[Math.floor(Math.random() * allUsers.length)];
          return createActivity({
            tenantId: tenant.id,
            assignedToId: assignedTo.id,
            companyId: deal.companyId!,
            contactId: deal.contactId!,
            dealId: deal.id,
          });
        }),
      );
      activities.push(...dealActivities);
    }
    console.log(`✅ Created ${activities.length} activities`);

    // Create notes for this tenant
    console.log('📝 Creating notes...');
    const notes = [];

    // Company notes
    for (const company of companies) {
      const companyNotes = await Promise.all(
        Array.from({ length: SEED_CONFIG.perTenant.notesPerCompany }, () =>
          createNote({
            tenantId: tenant.id,
            authorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
            companyId: company.id,
          }),
        ),
      );
      notes.push(...companyNotes);
    }

    // Contact notes
    for (const contact of contacts) {
      const contactNotes = await Promise.all(
        Array.from({ length: SEED_CONFIG.perTenant.notesPerContact }, () =>
          createNote({
            tenantId: tenant.id,
            authorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
            contactId: contact.id,
            companyId: contact.companyId!,
          }),
        ),
      );
      notes.push(...contactNotes);
    }

    // Deal notes
    for (const deal of deals) {
      const dealNotes = await Promise.all(
        Array.from({ length: SEED_CONFIG.perTenant.notesPerDeal }, () =>
          createNote({
            tenantId: tenant.id,
            authorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
            dealId: deal.id,
            companyId: deal.companyId!,
            contactId: deal.contactId!,
          }),
        ),
      );
      notes.push(...dealNotes);
    }

    console.log(`✅ Created ${notes.length} notes`);

    // Summary for this tenant
    console.log(`📊 Tenant "${tenant.name}" summary:`);
    console.log(`   👥 Users: ${allUsers.length}`);
    console.log(`   🏢 Companies: ${companies.length}`);
    console.log(`   👤 Contacts: ${contacts.length}`);
    console.log(`   💼 Deals: ${deals.length}`);
    console.log(`   📅 Activities: ${activities.length}`);
    console.log(`   📝 Notes: ${notes.length}`);
  }

  // Final summary
  const totalUsers = SEED_CONFIG.tenants * SEED_CONFIG.perTenant.users;
  const totalCompanies = SEED_CONFIG.tenants * SEED_CONFIG.perTenant.companies;
  const totalContacts =
    SEED_CONFIG.tenants *
    SEED_CONFIG.perTenant.companies *
    SEED_CONFIG.perTenant.contactsPerCompany;
  const totalDeals = SEED_CONFIG.tenants * SEED_CONFIG.perTenant.deals;
  const totalActivities =
    SEED_CONFIG.tenants *
    SEED_CONFIG.perTenant.deals *
    SEED_CONFIG.perTenant.activitiesPerDeal;
  const totalNotes =
    SEED_CONFIG.tenants *
    (SEED_CONFIG.perTenant.companies * SEED_CONFIG.perTenant.notesPerCompany +
      SEED_CONFIG.perTenant.companies *
        SEED_CONFIG.perTenant.contactsPerCompany *
        SEED_CONFIG.perTenant.notesPerContact +
      SEED_CONFIG.perTenant.deals * SEED_CONFIG.perTenant.notesPerDeal);

  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Total created:');
  console.log(`   🏢 Tenants: ${SEED_CONFIG.tenants}`);
  console.log(`   👥 Users: ${totalUsers}`);
  console.log(`   🏢 Companies: ${totalCompanies}`);
  console.log(`   👤 Contacts: ${totalContacts}`);
  console.log(`   💼 Deals: ${totalDeals}`);
  console.log(`   📅 Activities: ${totalActivities}`);
  console.log(`   📝 Notes: ${totalNotes}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
