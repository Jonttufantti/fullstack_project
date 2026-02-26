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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../components/Layout";
import ExpenseDialog from "../components/ExpenseDialog";
import { useAuth } from "../context/AuthContext";
import { type Expense } from "../types";

const formatDate = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("fi-FI");

const formatEur = (value: string) =>
  Number(value).toLocaleString("fi-FI", { style: "currency", currency: "EUR" });

export default function Expenses() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/expenses", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setExpenses);
  }, [token]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Kulut</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Uusi kulu
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Päivämäärä</TableCell>
              <TableCell>Kategoria</TableCell>
              <TableCell>Kuvaus</TableCell>
              <TableCell align="right">Summa</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                  Ei kuluja vielä
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description ?? "—"}</TableCell>
                  <TableCell align="right">{formatEur(expense.amount)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleDelete(expense.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(expense) => {
          setExpenses((prev) => [expense, ...prev]);
          setDialogOpen(false);
        }}
      />
    </Layout>
  );
}
