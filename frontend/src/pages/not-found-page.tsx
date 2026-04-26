import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { LanguageSwitcher } from '../components/language-switcher';
import { useI18n } from '../features/i18n/i18n-context';

export function NotFoundPage() {
  const { copy } = useI18n();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <LanguageSwitcher />
      </Box>

      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h3">404</Typography>
        <Typography color="text.secondary">{copy.notFound.message}</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          {copy.notFound.action}
        </Button>
      </Stack>
    </Box>
  );
}
