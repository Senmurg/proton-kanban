import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)',
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 480 }}>
        <Box>
          <Typography variant="h4">Proton Kanban</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5">{title}</Typography>
              </Box>
              {children}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
