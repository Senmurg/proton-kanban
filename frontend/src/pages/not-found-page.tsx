import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h3">404</Typography>
        <Typography color="text.secondary">Такой страницы пока нет.</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          На главную
        </Button>
      </Stack>
    </Box>
  );
}
