import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Layout from "../components/Layout";
import InvoiceDialog from "../components/InvoiceDialog";
import InvoiceDetailDialog from "../components/InvoiceDetailDialog";
import { useAuth } from "../context/AuthContext";
import { type Invoice } from "../types";

const statusColor = (status: Invoice["status"]) => {
  if (status === "paid") return "success";
  if (status === "sent") return "primary";
  return "default";
};

const formatDate = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("fi-FI");

const formatEur = (value: string) =>
  Number(value).toLocaleString("fi-FI", { style: "currency", currency: "EUR" });

const formatPaymentTerms = (inv: Invoice) => {
  if (inv.discountPercent && inv.discountDays) {
    return `${inv.discountDays} pv -${Number(inv.discountPercent).toFixed(0)}%, ${Math.round((new Date(inv.dueDate + "T00:00:00").getTime() - new Date(inv.issueDate + "T00:00:00").getTime()) / 86400000)} pv netto`;
  }
  const netDays = Math.round(
    (new Date(inv.dueDate + "T00:00:00").getTime() - new Date(inv.issueDate + "T00:00:00").getTime()) / 86400000
  );
  return `${netDays} pv netto`;
};

export default function Invoices() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetch("/api/invoices", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setInvoices);
  }, [token]);

  const handleDownloadPdf = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/invoices/${inv.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lasku-${inv.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/invoices/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleStatusChange = async (invoice: Invoice) => {
    const next: Record<Invoice["status"], Invoice["status"]> = {
      draft: "sent",
      sent: "paid",
      paid: "draft",
    };
    const newStatus = next[invoice.status];
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? { ...inv, status: newStatus } : inv))
      );
    }
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Invoices</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New invoice
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Issue date</TableCell>
              <TableCell>Due date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Payment terms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "text.secondary" }}>
                  No invoices yet
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  hover
                  onClick={() => setSelectedInvoice(inv)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.Client?.name ?? "—"}</TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>{formatDate(inv.dueDate)}</TableCell>
                  <TableCell align="right">{formatEur(inv.totalAmount)}</TableCell>
                  <TableCell>{formatPaymentTerms(inv)}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      color={statusColor(inv.status)}
                      size="small"
                      onClick={() => handleStatusChange(inv)}
                      sx={{ cursor: "pointer", textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => handleDownloadPdf(inv, e)}>
                      <PictureAsPdfIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(inv.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <InvoiceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(invoice) => {
          setInvoices((prev) => [invoice, ...prev]);
          setDialogOpen(false);
        }}
      />

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </Layout>
  );
}
