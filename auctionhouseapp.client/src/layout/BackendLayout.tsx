import { useState } from 'react';
import type { FC, ReactElement, MouseEvent } from 'react';
import { Outlet, useNavigate, useNavigation } from "react-router";
import { useEventCallback, CircularProgress, AppBar, Toolbar, Typography, Box, Slide, IconButton, Menu, MenuItem, Divider, ListItemIcon, Container, Alert } from '@mui/material';
import MuiLink from '@mui/material/Link';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useAtomValue } from 'jotai';
import Overlay from './Overlay';
import { selectIsAuthedStaff, staffAccountAtom, useStaffAccountAction } from '../atoms/staffAccountAtom';
// icons
//import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children?: ReactElement<unknown>;
}

function HideOnScroll(props: Props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

export default function HideAppBar(props: Props) {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const isNavigating = Boolean(navigation.location);
  //const isAuthed = useAtomValue(selectAuthed)
  const isAuthedStaff = useAtomValue(selectIsAuthedStaff)
  const acct = useAtomValue(staffAccountAtom)
  const { logoutAsync } = useStaffAccountAction()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenu = useEventCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  });

  const handleClose = useEventCallback(() => {
    setAnchorEl(null);
  });

  const handleLogout = useEventCallback(async () => {
    setAnchorEl(null);
    await logoutAsync();
  });

  const handleGoHome = useEventCallback(() => {
    navigate('/backend');
  });

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleGoHome}
              sx={{ mr: 2 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              慈善拍賣後台
            </Typography>
            {isAuthedStaff && (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <AccountIcon color='primary' />
                    </ListItemIcon>
                    {`${acct.loginUserId}/${acct.loginUserName}`}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon color='primary' />
                    </ListItemIcon>
                    登出
                  </MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Box>
        <main>
          {isNavigating && <GlobalSpinner />}
          {isAuthedStaff ? <Outlet /> : <NotAuthorized />}
          {/* <Outlet /> */}
        </main>
        <pre>account: {JSON.stringify(acct, null, 2)}</pre>
      </Box>
      <Overlay />
    </>
  );
}

//=============================================================================
const GlobalSpinner: FC = () => (
  <Box sx={{ textAlign: 'center', my: '3rem' }}>
    <CircularProgress color='info' size="5rem" />
  </Box>
)

//-----------------------------------------------------------------------------
//const Overlay: FC = () => {
//  const blocking = useAtomValue(blockingAtom)
//  const isAuthing = useAtomValue(selectAuthing)
//  return (
//    <Backdrop
//      sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//      open={blocking || isAuthing}
//    >
//      <CircularProgress color="inherit" size='6rem' />
//    </Backdrop>
//  )
//}

//-----------------------------------------------------------------------------
const NotAuthorized: FC = () => {
  return (
    <Container>
      {/* <Typography variant='h1'>401 NotAuthorized</Typography> */}
      <Alert severity='error' sx={{ fontSize: '1.5em', m: 3 }}>
        未登入請先登入。
        <MuiLink href='/stafflogin'>工作人員登入</MuiLink>
      </Alert>
    </Container>
  )
}
