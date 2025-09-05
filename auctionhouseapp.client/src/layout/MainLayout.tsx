import { Box, CircularProgress, Container, MenuItem, Select, } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import type { FC } from 'react'
import { Outlet, NavLink, useNavigation } from "react-router";

const navStyle = {
  display: 'flex',
  gap: 8,
};

export default function MainLayout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <Container>
      <nav style={navStyle}>
        <NavLink to="/">
          首頁
        </NavLink>
        <NavLink to="/demo01" target='_blank'>
          Demo01
        </NavLink>
        <NavLink to="/bidder/demo02" target='_blank'>
          Demo02
        </NavLink>
        <NavLink to="/lots" target='_blank'>
          拍品展覽
        </NavLink>
        <NavLink to="/bidder" target='_blank'>
          競標人
        </NavLink>
        <NavLink to="/auction" target='_blank'>
          拍賣官
        </NavLink>
        <NavLink to="/broadcast" target='_blank'>
          拍賣廣播
        </NavLink>
      </nav>

      <ModeSwitcher />

      <main>
        {isNavigating && <GlobalSpinner />}
        <Outlet />
      </main>
    </Container>
  );
}

//=============================================================================
const GlobalSpinner: FC = () => (
  <Box sx={{ textAlign: 'center', my: '3rem' }}>
    <CircularProgress color='info' size="5rem" />
  </Box>
)

//=============================================================================
const ModeSwitcher: FC = () => {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Select
      value={mode}
      onChange={(event) =>
        setMode(event.target.value as 'system' | 'light' | 'dark')
      }
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}