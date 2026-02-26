import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { type Expense } from "../types";

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
}

export default function ExpenseDialog({ open, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: Number(amount), date, category, description }),
    });
    if (!res.ok) return;
    const expense = await res.json();
    onCreated(expense);
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Uusi kulu</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        <TextField
          label="Summa (€)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
          disabled={!amount || !date || !category}
        >
          Tallenna
        </Button>
      </DialogActions>
    </Dialog>
  );
}
