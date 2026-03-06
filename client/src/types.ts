export interface PaymentTerm {
  id: number;
  label: string;
  netDays: number;
  discountPercent: string | null;
  discountDays: number | null;
  userId: number | null;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Expense {
  id: number;
  title: string | null;
  subtotal: string;
  vatAmount: string;
  totalAmount: string;
  date: string;
  category: string;
  description: string | null;
  vatRate: string;
}

export interface DashboardData {
  totalInvoiced: number;
  totalPaid: number;
  totalUnpaid: number;
  totalExpenses: number;
  monthlyExpenses: { month: string; total: number }[];
  recentInvoices: (Invoice & { Client?: { name: string } })[];
  recentExpenses: Expense[];
}

export interface Invoice {
  id: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid";
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  discountPercent: string | null;
  discountDays: number | null;
  Client?: { id: number; name: string; email: string; address: string };
}
