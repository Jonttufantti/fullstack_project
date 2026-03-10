import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { type Client, type Invoice, type PaymentTerm } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (invoice: Invoice) => void;
  invoice?: Invoice;
  onUpdated?: (invoice: Invoice) => void;
}

const VAT_RATES = [
  { label: "25,5 % (yleinen)", value: 25.5 },
  { label: "13,5 % (elintarvikkeet)", value: 13.5 },
  { label: "10 % (kulttuuri, liikunta)", value: 10 },
  { label: "0 % (veroton)", value: 0 },
];

export default function InvoiceDialog({ open, onClose, onCreated, invoice, onUpdated }: Props) {
  const { token } = useAuth();
  const isEditing = !!invoice;

  const [clients, setClients] = useState<Client[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentTermId, setPaymentTermId] = useState<number | "">("");
  const [subtotal, setSubtotal] = useState("");
  const [vatRate, setVatRate] = useState(25.5);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const selectedTerm = paymentTerms.find((t) => t.id === paymentTermId);

  const subtotalNum = Number(subtotal) || 0;
  const vatAmount = (subtotalNum * vatRate) / 100;
  const totalAmount = subtotalNum + vatAmount;

  const dueDateDisplay = (() => {
    if (!issueDate || !selectedTerm) return null;
    const d = new Date(issueDate + "T00:00:00");
    d.setDate(d.getDate() + selectedTerm.netDays);
    return d.toLocaleDateString("fi-FI");
  })();

  useEffect(() => {
    if (!open) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/clients", { headers }).then((r) => r.json()),
      fetch("/api/payment-terms", { headers }).then((r) => r.json()),
    ]).then(([c, p]) => {
      setClients(c);
      setPaymentTerms(p);

      if (invoice) {
        // Muokkaustila: täytetään kentät olemassa olevasta laskusta
        setClientId(String(invoice.clientId));
        setIssueDate(invoice.issueDate);
        setPaymentDate(invoice.paymentDate ?? "");
        setSubtotal(invoice.subtotal);
        setVatRate(Number(invoice.vatRate));
        setPaymentTermId(invoice.paymentTermId ?? "");
      } else {
        // Luontitila: aseta oletukseksi "30 päivää netto"
        const defaultTerm = p.find((t: PaymentTerm) => t.label === "30 päivää netto");
        if (defaultTerm) setPaymentTermId(defaultTerm.id);
      }
    });
  }, [open, token, invoice]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    if (isEditing) {
      // Laske eräpäivä valitun maksuehdon mukaan
      let dueDate: string | undefined;
      if (selectedTerm && issueDate) {
        const d = new Date(issueDate + "T00:00:00");
        d.setDate(d.getDate() + selectedTerm.netDays);
        dueDate = d.toISOString().split("T")[0];
      }

      const res = await fetch(`/api/invoices/${invoice!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: Number(clientId),
          issueDate,
          dueDate,
          paymentDate: paymentDate || null,
          subtotal: Number(subtotal),
          vatRate,
          discountPercent: selectedTerm?.discountPercent ?? null,
          discountDays: selectedTerm?.discountDays ?? null,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setServerError(data.error || "Failed to update invoice");
        return;
      }
      onUpdated?.(data);
    } else {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: Number(clientId),
          issueDate,
          subtotal: Number(subtotal),
          vatRate,
          paymentTermId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setServerError(data.error || "Failed to create invoice");
        return;
      }

      onCreated(data);
      setClientId("");
      setIssueDate("");
      setPaymentDate("");
      setSubtotal("");
      setVatRate(25.5);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? `Muokkaa laskua ${invoice!.invoiceNumber}` : "New invoice"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            select
            label="Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Laskutuspäivä"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Maksupäivä (valinnainen)"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            select
            label="Payment terms"
            value={paymentTermId}
            onChange={(e) => setPaymentTermId(Number(e.target.value))}
            required
          >
            {paymentTerms.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>

          {dueDateDisplay && (
            <Typography variant="body2" color="text.secondary">
              Due date: {dueDateDisplay}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Subtotal (€)"
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <TextField
              select
              label="VAT rate"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
              fullWidth
            >
              {VAT_RATES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {subtotalNum > 0 && (
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              {selectedTerm?.discountPercent && (
                <Typography variant="body2" color="text.secondary">
                  Early payment ({selectedTerm.discountDays} pv): -
                  {Number(selectedTerm.discountPercent).toFixed(0)}%
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                VAT ({vatRate}%): {vatAmount.toFixed(2)} €
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                Total: {totalAmount.toFixed(2)} €
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Tallenna muutokset" : "Create invoice"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
