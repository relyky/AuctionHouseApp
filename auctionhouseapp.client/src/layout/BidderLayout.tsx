import { BottomNavigation, BottomNavigationAction, Box, CircularProgress, Paper } from '@mui/material';
import type { FC } from 'react';
import { Outlet, Link, useLocation, useNavigation } from 'react-router';
// icons
import HomeIcon from '@mui/icons-material/Home';
import RegisterIcon from '@mui/icons-material/HowToReg';
import MoneyIcon from '@mui/icons-material/Money';
import StarsIcon from '@mui/icons-material/Stars';

export default function BidderLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  //console.log('BidderLayout.render', { navigation, location })
  return (
    <Box sx={{ pb: 7 }}>
      {isNavigating && <GlobalSpinner />}
      <Outlet />
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels>
          <BottomNavigationAction label="首頁" icon={<HomeIcon />}
            component={Link} to='/' />
          <BottomNavigationAction label="競標出價" icon={<MoneyIcon />}
            component={Link} to='/bidder/auc1010' 
            sx={location.pathname === '/bidder/auc1010' ? { display: 'none' } : null}
          />
          <BottomNavigationAction label="競標人註冊" icon={<RegisterIcon />}
            component={Link} to='/bidder/auc1020'
            sx={location.pathname === '/bidder/auc1020' ? { display: 'none' } : null}
          />
          <BottomNavigationAction label="得標清冊" icon={<StarsIcon />}
            component={Link} to='/bidder/auc1030' 
            sx={location.pathname === '/bidder/auc1030' ? { display: 'none' } : null}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

//=============================================================================
const GlobalSpinner: FC = () => (
  <Box sx={{ textAlign: 'center', my: '3rem' }}>
    <CircularProgress color='info' size="5rem" />
  </Box>
)