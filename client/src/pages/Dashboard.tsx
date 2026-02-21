import { Typography } from '@mui/material';
import Layout from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Dashboard coming soon...
      </Typography>
    </Layout>
  );
}
