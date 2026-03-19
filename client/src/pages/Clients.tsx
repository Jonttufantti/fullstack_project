import { useEffect, useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Layout from '../components/Layout';
import ClientDialog from '../components/ClientDialog';
import { useAuth } from '../context/AuthContext';
import { useApiFetch } from '../hooks/useApiFetch';
import { type Client } from '../types';

export default function Clients() {
  const { token } = useAuth();
  const apiFetch = useApiFetch();
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const res = await apiFetch('/api/clients');
      const data = await res.json();
      setClients(data);
    };

    fetchClients();
  }, [token]);

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Clients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
          New client
        </Button>
      </Box>

<Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                  No clients yet
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => { setEditingClient(client); setDialogOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(client.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <ClientDialog
        key={editingClient?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingClient(null); }}
        client={editingClient ?? undefined}
        onSaved={(saved) => {
          setClients((prev) =>
            editingClient
              ? prev.map((c) => (c.id === saved.id ? saved : c))
              : [...prev, saved]
          );
          setDialogOpen(false);
          setEditingClient(null);
        }}
      />
    </Layout>
  );
}
