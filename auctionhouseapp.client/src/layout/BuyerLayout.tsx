import { useState } from 'react';
import type { FC, ReactElement, MouseEvent } from 'react';
import { Outlet, useNavigate, useNavigation } from "react-router";
import { useEventCallback, CircularProgress, AppBar, Toolbar, Typography, Box, Slide, IconButton, Menu, MenuItem, Divider, ListItemIcon, Container, Backdrop, Alert } from '@mui/material';
import MuiLink from '@mui/material/Link';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useAtomValue } from 'jotai';
import Overlay from './Overlay';
// icons
//import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';

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

  const handleGoHome = useEventCallback(() => {
    navigate('/');
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
              慈善拍賣買家前台
            </Typography>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Box>
        <main>
          {isNavigating && <GlobalSpinner />}
          <Outlet />
        </main>
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
