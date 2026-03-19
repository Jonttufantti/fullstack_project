import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { type Client } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  client?: Client;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => /^[+\d][\d\s-]{6,14}$/.test(phone);

export default function ClientDialog({
  open,
  onClose,
  onSaved,
  client,
}: Props) {
  const { token } = useAuth();
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [address, setAddress] = useState(client?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const isEditing = !!client;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (email && !isValidEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (phone && !isValidPhone(phone)) {
      newErrors.phone =
        "Enter a valid phone number (e.g. 040 1234567 or +358401234567)";
    }
    return newErrors;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    if (isEditing) {
      const res = await fetch(`/api/clients/${client!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setServerError(data.error || "Failed to update client");
        return;
      }
      onSaved?.(data);
    } else {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setServerError(data.error || "Failed to create client");
        return;
      }

      onSaved(data);
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? `Edit client ${client!.name}` : "New client"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone ?? "e.g. 040 1234567 or +358401234567"}
          />
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
