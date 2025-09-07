import { useState } from 'react';
import type { FC, ReactElement, MouseEvent } from 'react';
import { Outlet, useNavigation } from "react-router";
import { CircularProgress, AppBar, Toolbar, Typography, Box, Slide, IconButton, Menu, MenuItem, Divider, ListItemIcon, Avatar } from '@mui/material';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useAtomValue } from 'jotai';
import { staffAccountAtom } from '../atoms/staffAccountAtom';
// icons
import MenuIcon from '@mui/icons-material/Menu';
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
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const isAuthed = useAtomValue(staffAccountAtom)
  const acct = useAtomValue(staffAccountAtom)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              慈善拍賣後台
            </Typography>
            {isAuthed && (
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
                  <MenuItem onClick={handleClose}>
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
          <Outlet />
        </main>
      </Box>
    </>
  );
}

//=============================================================================
const GlobalSpinner: FC = () => (
  <Box sx={{ textAlign: 'center', my: '3rem' }}>
    <CircularProgress color='info' size="5rem" />
  </Box>
)
