import { Container, Typography, Box, Paper } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function App() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <AccountBalanceWalletIcon
            sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            Freelancer Finance
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Financial management for freelancers and small businesses
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
