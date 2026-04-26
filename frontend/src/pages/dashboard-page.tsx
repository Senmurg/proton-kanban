import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../components/page-header';
import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';
import { listProjects } from '../features/projects/projects-api';

export function DashboardPage() {
  const { accessToken, user } = useAuth();
  const { copy } = useI18n();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(accessToken!),
    enabled: Boolean(accessToken),
  });

  const cards = [
    {
      title: copy.dashboard.projectsTitle,
      value: projectsQuery.data?.length ?? 0,
      hint: copy.dashboard.projectsHint,
      icon: <FolderRoundedIcon color="primary" />,
    },
    {
      title: copy.dashboard.userTitle,
      value: user?.full_name ?? user?.email ?? '—',
      hint: copy.dashboard.userHint,
      icon: <PersonRoundedIcon color="primary" />,
    },
    {
      title: copy.dashboard.accessTitle,
      value: copy.dashboard.accessValue,
      hint: copy.dashboard.accessHint,
      icon: <BoltRoundedIcon color="primary" />,
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title={copy.dashboard.title} subtitle={copy.dashboard.subtitle} />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent>
              <Stack spacing={2}>
                {card.icon}
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
                <Typography variant="h5">{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.hint}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {projectsQuery.error ? (
        <Alert severity="error">
          {projectsQuery.error instanceof Error ? projectsQuery.error.message : copy.dashboard.loadFailed}
        </Alert>
      ) : null}
    </Stack>
  );
}
