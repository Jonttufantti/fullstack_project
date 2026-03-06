import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { type Expense } from "../types";

const VAT_RATES = [
  { label: "25,5 %", value: 25.5 },
  { label: "13,5 %", value: 13.5 },
  { label: "10 %", value: 10 },
  { label: "0 %", value: 0 },
];

const CATEGORIES = [
  "Matka",
  "Toimisto",
  "Ohjelmistot",
  "Laitteisto",
  "Markkinointi",
  "Koulutus",
  "Muu",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (expense: Expense) => void;
  expense?: Expense;
  onUpdated?: (expense: Expense) => void;
}

export default function ExpenseDialog({
  open,
  onClose,
  onCreated,
  expense,
  onUpdated,
}: Props) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [vatRate, setVatRate] = useState(25.5);

  const subtotalNum = Number(subtotal) || 0;
  const vatAmount = (subtotalNum * vatRate) / 100;
  const totalAmount = subtotalNum + vatAmount;

  useEffect(() => {
    if (expense) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(expense.title ?? "");
      setSubtotal(expense.subtotal);
      setDate(expense.date);
      setCategory(expense.category);
      setDescription(expense.description ?? "");
      setVatRate(Number(expense.vatRate));
    } else {
      setTitle("");
      setSubtotal("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setDescription("");
      setVatRate(25.5);
    }
  }, [expense]);

  const handleSubmit = async () => {
    const isEditing = expense ? true : false;
    if (!isEditing) {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subtotal: Number(subtotal),
          date,
          category,
          description,
          vatRate,
        }),
      });
      if (!res.ok) return;
      const saved = await res.json();
      onCreated(saved);
      setTitle("");
      setSubtotal("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setDescription("");
      setVatRate(25.5);
    } else {
      const res = await fetch(`/api/expenses/${expense?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subtotal: Number(subtotal),
          date,
          category,
          description,
          vatRate,
        }),
      });
      if (!res.ok) return;
      const saved = await res.json();
      onUpdated?.(saved);
      setTitle("");
      setSubtotal("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setDescription("");
      setVatRate(25.5);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{expense ? "Muokkaa kulua" : "Uusi kulu"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        <TextField
          label="Ostopaikka / otsikko (valinnainen)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Summa (€)"
          type="number"
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
          required
        />
        <TextField
          label="Päivämäärä"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <TextField
          label="Kategoria"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="ALV-kanta"
          select
          value={vatRate}
          onChange={(e) => setVatRate(Number(e.target.value))}
          required
        >
          {VAT_RATES.map((r) => (
            <MenuItem key={r.value} value={r.value}>
              {r.label}
            </MenuItem>
          ))}
        </TextField>
        {subtotalNum > 0 && (
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ALV ({vatRate}%): {vatAmount.toFixed(2)} €
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              Yhteensä (sis. ALV): {totalAmount.toFixed(2)} €
            </Typography>
          </Box>
        )}
        <TextField
          label="Kuvaus (valinnainen)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!subtotal || !date || !category}
        >
          Tallenna
        </Button>
      </DialogActions>
    </Dialog>
  );
}
