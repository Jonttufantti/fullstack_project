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
  amount: string;
  date: string;
  category: string;
  description: string | null;
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
