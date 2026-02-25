import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { type Invoice } from "../types";
import { useAuth } from "../context/AuthContext";

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("fi-FI");

const formatEur = (value: string) =>
  Number(value).toLocaleString("fi-FI", { style: "currency", currency: "EUR" });

const statusColor = (status: Invoice["status"]) => {
  if (status === "paid") return "success";
  if (status === "sent") return "primary";
  return "default";
};

export default function InvoiceDetailDialog({ invoice, onClose }: Props) {
  const { token } = useAuth();

  if (!invoice) return null;

  const handleDownloadPdf = async () => {
    const res = await fetch(`/api/invoices/${invoice.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lasku-${invoice.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );

  return (
    <Dialog open={!!invoice} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6">Lasku {invoice.invoiceNumber}</Typography>
          <Chip
            label={invoice.status}
            color={statusColor(invoice.status)}
            size="small"
            sx={{ mt: 0.5, textTransform: "capitalize" }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
        >
          Lataa PDF
        </Button>
      </DialogTitle>

      <DialogContent>
        <Typography variant="overline" color="text.secondary">Asiakas</Typography>
        <Typography variant="body1" fontWeight={500} mb={2}>
          {invoice.Client?.name ?? "—"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="text.secondary">Päivämäärät</Typography>
        <Row label="Laskutuspäivä" value={formatDate(invoice.issueDate)} />
        <Row label="Eräpäivä" value={formatDate(invoice.dueDate)} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="overline" color="text.secondary">Summat</Typography>
        <Row label="Veroton" value={formatEur(invoice.subtotal)} />
        <Row label={`ALV ${Number(invoice.vatRate).toFixed(1)} %`} value={formatEur(invoice.vatAmount)} />
        {invoice.discountPercent && invoice.discountDays && (
          <Typography variant="caption" color="text.secondary">
            Käteisalennus {Number(invoice.discountPercent).toFixed(0)} % / {invoice.discountDays} pv
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Row label="Yhteensä" value={formatEur(invoice.totalAmount)} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Sulje</Button>
      </DialogActions>
    </Dialog>
  );
}
