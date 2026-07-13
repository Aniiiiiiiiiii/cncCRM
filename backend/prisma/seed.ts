import { PrismaClient, UserStatus, LeadStatus, DealStatus, ProjectStatus, TaskPriority, TaskStatus, EmployeeStatus, AttendanceStatus, LeaveType, LeaveStatus, TicketPriority, TicketStatus, InvoiceStatus, ExpenseStatus, CampaignType, CampaignStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding enterprise database...');

  // 1) Clean database
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
  
  const tables = [
    'AuditLog', 'Timeline', 'Activity', 'Notification', 'Message', 'ChatGroupMember', 'ChatGroup',
    'Meeting', 'Document', 'Folder', 'Article', 'ArticleCategory', 'Campaign', 'Expense',
    'Payment', 'Invoice', 'Ticket', 'TicketCategory', 'Leave', 'Attendance', 'Employee',
    'Designation', 'Department', 'Client', 'Comment', 'ChecklistItem', 'Task', 'Milestone',
    'ProjectMember', 'Project', 'Deal', 'Pipeline', 'Contact', 'Organization', 'Lead',
    'RolePermission', 'Permission', 'User', 'Role'
  ];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
    } catch (e) {
      // Table might not exist or other issues, safe to catch
    }
  }
  
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log('🧹 Database tables truncated.');

  // 2) Create Roles
  const roles = [
    { name: 'Super Admin', description: 'Complete system access and absolute administration' },
    { name: 'Admin', description: 'General administration with standard administrative controls' },
    { name: 'HR', description: 'Employee management, attendance, leave approval, and designation control' },
    { name: 'Sales Manager', description: 'Sales pipeline monitoring, leads assignments, and commission checks' },
    { name: 'Sales Executive', description: 'Lead handling, deal management, activity tracks, and client calls' },
    { name: 'Marketing Manager', description: 'Campaign coordination, lead source analytical views, and conversion stats' },
    { name: 'Marketing Executive', description: 'Creating landing campaigns, executing email flows, and analytics tracking' },
    { name: 'Project Manager', description: 'Task delegator, milestone regulator, gantt controller' },
    { name: 'Developer', description: 'Writing codes, completing tasks, logging times' },
    { name: 'Support Agent', description: 'Resolving tickets, managing client portals, SLA adjustments' },
    { name: 'Accountant', description: 'Generating invoices, recording payments, tracking expenses, filing taxes' },
    { name: 'Client', description: 'Client portal view, project tracking, ticket creation, invoice receipt' },
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of roles) {
    dbRoles[r.name] = await prisma.role.create({ data: r });
  }
  console.log('👥 Roles seeded.');

  // 3) Create Permissions
  const permissions = [
    { name: 'Complete Administration', code: 'ALL_ACCESS', description: 'Override all restrictions' },
    { name: 'Manage Authentications', code: 'AUTH_MANAGE', description: 'Change roles and force logout' },
    { name: 'View Users', code: 'USER_VIEW', description: 'View user database' },
    { name: 'Create Users', code: 'USER_CREATE', description: 'Create standard user profiles' },
    { name: 'Edit Users', code: 'USER_EDIT', description: 'Modify user profiles' },
    { name: 'Delete Users', code: 'USER_DELETE', description: 'Remove users from records' },
    
    { name: 'View Leads', code: 'LEAD_VIEW', description: 'View crm leads' },
    { name: 'Create Leads', code: 'LEAD_CREATE', description: 'Add new crm leads' },
    { name: 'Edit Leads', code: 'LEAD_EDIT', description: 'Edit crm leads' },
    { name: 'Delete Leads', code: 'LEAD_DELETE', description: 'Remove crm leads' },
    
    { name: 'View Projects', code: 'PROJECT_VIEW', description: 'View active projects' },
    { name: 'Create Projects', code: 'PROJECT_CREATE', description: 'Start projects and milestones' },
    { name: 'Edit Projects', code: 'PROJECT_EDIT', description: 'Modify project deliverables' },
    { name: 'Manage Tasks', code: 'TASK_MANAGE', description: 'Assign, write, and review tasks' },
    
    { name: 'Manage Tickets', code: 'TICKET_MANAGE', description: 'Resolve, close, assign tickets' },
    { name: 'Manage Invoices', code: 'INVOICE_MANAGE', description: 'Create and review accounting sheets' },
    { name: 'Manage Expenses', code: 'EXPENSE_MANAGE', description: 'Claim and audit corporate expenses' },
  ];

  const dbPerms: Record<string, any> = {};
  for (const p of permissions) {
    dbPerms[p.code] = await prisma.permission.create({ data: p });
  }
  console.log('🔑 Permissions seeded.');

  // 4) Map Permissions to Roles
  // Super Admin gets all permissions
  for (const pCode of Object.keys(dbPerms)) {
    await prisma.rolePermission.create({
      data: {
        roleId: dbRoles['Super Admin'].id,
        permissionId: dbPerms[pCode].id,
      },
    });
  }

  // Sales Manager permissions
  const salesManagerPerms = ['LEAD_VIEW', 'LEAD_CREATE', 'LEAD_EDIT', 'LEAD_DELETE', 'PROJECT_VIEW'];
  for (const pCode of salesManagerPerms) {
    await prisma.rolePermission.create({
      data: {
        roleId: dbRoles['Sales Manager'].id,
        permissionId: dbPerms[pCode].id,
      },
    });
  }

  // Developer permissions
  const devPerms = ['PROJECT_VIEW', 'TASK_MANAGE'];
  for (const pCode of devPerms) {
    await prisma.rolePermission.create({
      data: {
        roleId: dbRoles['Developer'].id,
        permissionId: dbPerms[pCode].id,
      },
    });
  }
  console.log('🗺️ Role-Permission mappings created.');

  // 5) Create Default Users with hashed passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('An1meParadise@2026', salt);

  const usersData = [
    {
      email: 'superadmin@codenclicks.com',
      password: passwordHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      roleId: dbRoles['Super Admin'].id,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    {
      email: 'salesmanager@codenclicks.com',
      password: passwordHash,
      firstName: 'Priya',
      lastName: 'Nair',
      roleId: dbRoles['Sales Manager'].id,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    {
      email: 'hrmanager@codenclicks.com',
      password: passwordHash,
      firstName: 'Anjali',
      lastName: 'Mehta',
      roleId: dbRoles['HR'].id,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    {
      email: 'developer@codenclicks.com',
      password: passwordHash,
      firstName: 'Amit',
      lastName: 'Patel',
      roleId: dbRoles['Developer'].id,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    {
      email: 'client@codenclicks.com',
      password: passwordHash,
      firstName: 'Robert',
      lastName: 'Downey',
      roleId: dbRoles['Client'].id,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  ];

  const dbUsers: Record<string, any> = {};
  for (const u of usersData) {
    dbUsers[u.email] = await prisma.user.create({ data: u });
  }
  console.log('👤 Core Users seeded.');

  // 6) Create Organizations & Contacts
  const orgs = [
    { name: 'Acme Software', industry: 'SaaS Development', website: 'acme.com', phone: '1234567890', address: '123 Silicon Valley' },
    { name: 'Tech Solutions Ltd', industry: 'Network Infrastructure', website: 'techsolutions.com', phone: '0987654321', address: '456 Cyber Hub' },
  ];
  
  const dbOrgs: Record<string, any> = {};
  for (const o of orgs) {
    dbOrgs[o.name] = await prisma.organization.create({ data: o });
  }

  const contactData = [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@acme.com',
      phone: '9898989898',
      jobTitle: 'VP Technology',
      organizationId: dbOrgs['Acme Software'].id,
      createdAt: new Date(),
    },
    {
      firstName: 'David',
      lastName: 'Miller',
      email: 'david@techsolutions.com',
      phone: '8787878787',
      jobTitle: 'Director Procurement',
      organizationId: dbOrgs['Tech Solutions Ltd'].id,
      createdAt: new Date(),
    },
  ];
  for (const c of contactData) {
    await prisma.contact.create({ data: c });
  }
  console.log('🏢 Organizations and Contacts seeded.');

  // 7) Create Leads
  const leadsData = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      phone: '9999888877',
      company: 'Innovate Corp',
      status: LeadStatus.NEW,
      source: 'Google Ads',
      score: 45,
      notes: 'Interested in bespoke Enterprise Resource ERP.',
      createdById: dbUsers['salesmanager@codenclicks.com'].id,
      assignedToId: dbUsers['salesmanager@codenclicks.com'].id,
    },
    {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sconnor@cyberdyne.org',
      phone: '8888777766',
      company: 'Cyberdyne Systems',
      status: LeadStatus.QUALIFIED,
      source: 'LinkedIn Referral',
      score: 85,
      notes: 'High intent. Proposal requested for backup security infrastructure.',
      createdById: dbUsers['salesmanager@codenclicks.com'].id,
      assignedToId: dbUsers['salesmanager@codenclicks.com'].id,
    },
    {
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@waynecorp.com',
      phone: '7777666655',
      company: 'Wayne Enterprises',
      status: LeadStatus.PROPOSAL_SENT,
      source: 'Cold Outreach',
      score: 95,
      notes: 'Proposal sent for advanced network security cloud architecture.',
      createdById: dbUsers['salesmanager@codenclicks.com'].id,
      assignedToId: dbUsers['salesmanager@codenclicks.com'].id,
    },
  ];

  for (const l of leadsData) {
    await prisma.lead.create({ data: l });
  }
  console.log('📈 Leads seeded.');

  // 8) Pipelines & Deals
  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Corporate Software Sales',
      description: 'Major corporate accounts licensing pipeline',
    },
  });

  const deals = [
    {
      name: 'Cyberdyne Security Suite',
      value: 75000.00,
      stage: 'Proposal Sent',
      probability: 60,
      status: DealStatus.ACTIVE,
      pipelineId: pipeline.id,
      createdById: dbUsers['salesmanager@codenclicks.com'].id,
      assignedToId: dbUsers['salesmanager@codenclicks.com'].id,
    },
    {
      name: 'Wayne Enterprises Satellite Sync',
      value: 250000.00,
      stage: 'Negotiation',
      probability: 80,
      status: DealStatus.ACTIVE,
      pipelineId: pipeline.id,
      createdById: dbUsers['salesmanager@codenclicks.com'].id,
      assignedToId: dbUsers['salesmanager@codenclicks.com'].id,
    },
  ];

  for (const d of deals) {
    await prisma.deal.create({ data: d });
  }
  console.log('🤝 Pipelines and Deals seeded.');

  // 9) Clients, Projects & Tasks
  const client = await prisma.client.create({
    data: {
      companyName: 'Stark Industries',
      contactName: 'Tony Stark',
      email: 'tony@stark.com',
      phone: '555123456',
      website: 'starkindustries.com',
      status: 'ACTIVE',
      address: 'Stark Tower, New York',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Iron Man Armor HUD Refresh',
      description: 'Upgrade high-speed radar rendering engine in current targeting systems.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-09-30'),
      budget: 150000.00,
      clientId: client.id,
      managerId: dbUsers['superadmin@codenclicks.com'].id,
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: dbUsers['developer@codenclicks.com'].id,
      role: 'Frontend Developer',
    },
  });

  const milestone = await prisma.milestone.create({
    data: {
      name: 'Core Radar Modules',
      description: 'Initialize base vector rendering buffers.',
      dueDate: new Date('2026-06-30'),
      projectId: project.id,
    },
  });

  const task = await prisma.task.create({
    data: {
      title: 'Optimize targeting grid calculations',
      description: 'Write optimized HSL-based mapping vectors to clear 3D overlays.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2026-06-15'),
      projectId: project.id,
      milestoneId: milestone.id,
      creatorId: dbUsers['superadmin@codenclicks.com'].id,
      assigneeId: dbUsers['developer@codenclicks.com'].id,
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      { title: 'Create targeting mock buffers', isCompleted: true, taskId: task.id },
      { title: 'Refactor canvas mapping loops', isCompleted: false, taskId: task.id },
    ],
  });
  console.log('🏗️ Clients, Projects, and Tasks seeded.');

  // 10) HRMS - Departments & Employees
  const engineeringDept = await prisma.department.create({
    data: { name: 'Engineering', description: 'Core software architects and developers' },
  });
  
  const leadDeveloperDesig = await prisma.designation.create({
    data: { name: 'Senior Software Developer', description: 'Lead architectural and code developer' },
  });

  const employee = await prisma.employee.create({
    data: {
      employeeCode: 'CNC-2026-001',
      joiningDate: new Date('2025-01-15'),
      salary: 95000.00,
      status: EmployeeStatus.ACTIVE,
      bankDetails: JSON.stringify({ bank: 'Chase Bank', account: '1234567890', routing: '021000021' }),
      userId: dbUsers['developer@codenclicks.com'].id,
      departmentId: engineeringDept.id,
      designationId: leadDeveloperDesig.id,
    },
  });

  await prisma.attendance.create({
    data: {
      date: new Date('2026-05-30'),
      clockIn: new Date('2026-05-30T09:02:15Z'),
      clockOut: new Date('2026-05-30T18:05:22Z'),
      status: AttendanceStatus.PRESENT,
      ipAddress: '192.168.1.10',
      employeeId: employee.id,
    },
  });

  await prisma.leave.create({
    data: {
      leaveType: LeaveType.CASUAL,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
      reason: 'Personal family trip',
      status: LeaveStatus.PENDING,
      employeeId: employee.id,
    },
  });
  console.log('🧬 HRMS Employees, Attendance, and Leaves seeded.');

  // 11) Support Tickets
  const cat = await prisma.ticketCategory.create({
    data: { name: 'Billing', description: 'Invoices, taxation, and portal payment topics' },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-1002',
      subject: 'Portal billing dispute',
      description: 'Stark Industries invoice INV-2026-0001 seems to have added standard sales tax. We should be tax exempt.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      slaDeadline: new Date('2026-06-02T15:00:00Z'),
      categoryId: cat.id,
      clientId: client.id,
    },
  });
  console.log('🎫 Tickets seeded.');

  // 12) Invoices & Expenses
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      issueDate: new Date('2026-05-15'),
      dueDate: new Date('2026-06-15'),
      status: InvoiceStatus.UNPAID,
      taxRate: 18.00,
      discount: 0.00,
      subtotal: 100000.00,
      total: 118000.00,
      items: JSON.stringify([
        { description: 'Iron Man Target HUD Refactor Phase 1', qty: 1, unitPrice: 100000.00, amount: 100000.00 },
      ]),
      clientId: client.id,
    },
  });

  await prisma.expense.create({
    data: {
      amount: 1500.00,
      category: 'Software Licenses',
      date: new Date('2026-05-20'),
      description: 'Annual premium CAD modeling license subscription.',
      status: ExpenseStatus.APPROVED,
      createdById: dbUsers['superadmin@codenclicks.com'].id,
      approvedById: dbUsers['superadmin@codenclicks.com'].id,
    },
  });
  console.log('💵 Invoices and Expenses seeded.');

  // 13) Knowledge Base & Chat setup
  const kcat = await prisma.articleCategory.create({
    data: { name: 'Lead Management Solutions', description: 'Best methods to capture high scoring leads' },
  });

  await prisma.article.create({
    data: {
      title: 'Scoring leads in CRM platform',
      slug: 'scoring-leads-in-crm',
      content: '## Lead Scoring Overview\nLead scoring tracks action events and maps values based on email opens...',
      status: 'PUBLISHED',
      categoryId: kcat.id,
    },
  });

  console.log('📚 Articles seeded.');
  console.log('✅ Enterprise database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Database seed failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
