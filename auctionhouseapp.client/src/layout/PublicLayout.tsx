import { Box, CircularProgress, Container } from '@mui/material';
import type { FC } from 'react';
import { NavLink, Outlet, useNavigation } from "react-router";

const navStyle = {
  display: 'flex',
  gap: 8,
};

/**
 * 公共區域
 */
export default function PublicLayout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <Container>
      <nav style={navStyle}>
        <NavLink to="/">
          首頁
        </NavLink>        
      </nav>
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
