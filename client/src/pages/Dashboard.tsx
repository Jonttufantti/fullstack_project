import { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useApiFetch } from '../hooks/useApiFetch';
import { type DashboardData } from '../types';

const formatEur = (value: number) =>
  value.toLocaleString('fi-FI', { style: 'currency', currency: 'EUR' });

const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('fi-FI');

const statusColor = (status: string) => {
  if (status === 'paid') return 'success';
  if (status === 'sent') return 'warning';
  return 'default';
};

const statusLabel = (status: string) => {
  if (status === 'paid') return 'Maksettu';
  if (status === 'sent') return 'Lähetetty';
  return 'Luonnos';
};

interface SummaryCardProps {
  label: string;
  value: number;
  color?: string;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="bold" color={color ?? 'text.primary'}>
        {formatEur(value)}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const apiFetch = useApiFetch();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(r => r.json())
      .then(setData);
  }, [token]);

  if (!data) {
    return (
      <Layout>
        <Typography color="text.secondary">Ladataan...</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Laskutettu yhteensä" value={data.totalInvoiced} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Maksettu" value={data.totalPaid} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Maksamatta" value={data.totalUnpaid} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Kulut yhteensä" value={data.totalExpenses} color="error.main" />
        </Grid>
      </Grid>

      {/* Monthly expenses chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Kulut kuukausittain
        </Typography>
        {data.monthlyExpenses.length === 0 ? (
          <Typography color="text.secondary">Ei kuluja viimeisen 6 kuukauden ajalta.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyExpenses}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v: number) => `${v} €`} />
              <Tooltip formatter={(v: number | undefined) => v != null ? formatEur(v) : ''} />
              <Bar dataKey="total" name="Kulut" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Recent invoices and expenses */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Viimeisimmät laskut
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Numero</TableCell>
                  <TableCell>Asiakas</TableCell>
                  <TableCell align="right">Summa</TableCell>
                  <TableCell>Tila</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                      Ei laskuja
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentInvoices.map(inv => (
                    <TableRow key={inv.id} hover>
                      <TableCell>{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.Client?.name ?? '—'}</TableCell>
                      <TableCell align="right">{formatEur(Number(inv.totalAmount))}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel(inv.status)}
                          color={statusColor(inv.status) as 'success' | 'warning' | 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Viimeisimmät kulut
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Päivämäärä</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell align="right">Summa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                      Ei kuluja
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentExpenses.map(exp => (
                    <TableRow key={exp.id} hover>
                      <TableCell>{formatDate(exp.date)}</TableCell>
                      <TableCell>{exp.category}</TableCell>
                      <TableCell align="right">{formatEur(Number(exp.totalAmount))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
