import type { FC } from 'react';
import { Link, Outlet, useNavigation } from 'react-router';
import { Alert, BottomNavigation, BottomNavigationAction, Box, CircularProgress, Paper } from '@mui/material';
import { useAtomValue } from 'jotai';
import { staffAccountAtom } from '../atoms/staffAccountAtom';
import Overlay from './Overlay';
// icons
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MoneyIcon from '@mui/icons-material/Money';

export default function RaffleLayout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  //const acct = useAtomValue(staffAccountAtom)
  const isAuthedStaff = useAtomValue(staffAccountAtom)

  //console.log('BidderLayout.render', { navigation, location })
  return (
    <Box sx={{ pb: 7 }}>
      {isNavigating && <GlobalSpinner />}

      {!isAuthedStaff && <Alert severity="error" sx={{ m: 3 }}>未登入或登入驗證已過期！</Alert>}

      <Outlet />

      {/* for debug
        <pre>account: {JSON.stringify(acct, null, 2)}</pre>        
      */}

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels>
          <BottomNavigationAction label="後台首頁" icon={<HomeIcon color='primary' />}
            component={Link} to='/backend' />
          <BottomNavigationAction label="抽獎券銷售" icon={<MoneyIcon color='primary' />}
            component={Link} to='/raffle/sell'
          />
          <BottomNavigationAction label="抽獎券查詢" icon={<SearchIcon color='primary' />}
            component={Link} to='/raffle/sellquery'
          />
        </BottomNavigation>
      </Paper>
      <Overlay />
    </Box>
  );
}

//=============================================================================
const GlobalSpinner: FC = () => (
  <Box sx={{ textAlign: 'center', my: '3rem' }}>
    <CircularProgress color='info' size="5rem" />
  </Box>
)