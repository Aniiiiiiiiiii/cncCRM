export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface Lead {
  id: string;
  title?: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  source?: string;
  score: number;
  notes?: string;
  tags?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ON_HOLD';
  startDate?: string;
  endDate?: string;
  budget?: number;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  members?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  }[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  dueDate?: string;
  timeSpent: number;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  joiningDate: string;
  salary: number;
  status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
}

export interface Attendance {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  ipAddress?: string;
}

export interface Leave {
  id: string;
  leaveType: 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  slaDeadline?: string;
  category?: { name: string };
  assignee?: { firstName: string; lastName: string };
  client: { companyName: string; contactName: string };
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'UNPAID' | 'OVERDUE';
  taxRate: number;
  discount: number;
  subtotal: number;
  total: number;
  items: string; // JSON string
  client: { companyName: string };
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
}
