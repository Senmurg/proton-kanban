import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import {
  Alert,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../components/page-header';
import { useAuth } from '../features/auth/auth-context';
import { listProjects } from '../features/projects/projects-api';

export function DashboardPage() {
  const { accessToken, user } = useAuth();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(accessToken!),
    enabled: Boolean(accessToken),
  });

  const cards = [
    {

      value: projectsQuery.data?.length ?? 0,
      hint: 'Можно сразу переходить к CRUD для проектов.',
      icon: <FolderRoundedIcon color="primary" />,
    },
    {
      title: 'Пользователь',
      value: user?.full_name ?? user?.email ?? '—',
      hint: 'Профиль  с /users/me.',
      icon: <PersonRoundedIcon color="primary" />,
    },
    {
      title: 'Следующий шаг',
      value: 'Tasks',
      hint: 'Следующим шаг rbac и допилить регистрацию',
      icon: <BoltRoundedIcon color="primary" />,
    },
  ];

  return (
    <Stack spacing={3}>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card>
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
          </Grid>
        ))}
      </Grid>

      {projectsQuery.error ? (
        <Alert severity="error">
          {projectsQuery.error instanceof Error ? projectsQuery.error.message : 'Не удалось загрузить проекты'}
        </Alert>
      ) : null}
    </Stack>
  );
}
