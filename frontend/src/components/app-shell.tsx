import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';
import { LanguageSwitcher } from './language-switcher';

const DRAWER_WIDTH = 272;

export function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { copy } = useI18n();

  const navigation = useMemo(
    () => [
      { label: copy.navigation.dashboard, icon: <DashboardRoundedIcon />, to: '/' },
      { label: copy.navigation.projects, icon: <FolderRoundedIcon />, to: '/projects' },
      { label: copy.navigation.profile, icon: <AccountCircleRoundedIcon />, to: '/profile' },
    ],
    [copy],
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          src="/proton-logo-h.svg"
          alt={copy.common.appName}
          sx={{
            width: 32,
            height: 32,
            objectFit: 'contain',
          }}
        />
        <Typography variant="h6" fontWeight={700}>
          {copy.common.appName}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            selected={pathname === item.to}
            sx={{ mb: 1, borderRadius: 3 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Stack spacing={1.5} sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar>{user?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.full_name ?? copy.common.noName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Stack>

        <ListItemButton
          onClick={() => {
            logout();
            navigate('/login');
          }}
          sx={{ borderRadius: 3 }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary={copy.navigation.logout} />
        </ListItemButton>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(245, 247, 251, 0.85)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {!isDesktop && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {navigation.find((item) => item.to === pathname)?.label ?? copy.common.appName}
              </Typography>
            </Box>
          </Stack>

          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 12, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
