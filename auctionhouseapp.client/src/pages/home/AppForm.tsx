import type { FC } from 'react';
import { NavLink } from 'react-router'
import { Box, Button, Container, Paper } from "@mui/material";

export default function Home_AppForm() {

  return (
    <>
      <Jumbotron />
      <Container>
        <Box display='flex' flexWrap='wrap-reverse' justifyContent='space-around' gap={3} margin={3}>
          { }
          <Button component={NavLink} to="/rafflebuyer"
            variant='contained' size='large'
            sx={theme => ({
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              },
            })}>
            Buyer
          </Button>
          {/* 工作人員(進入後台) */}
          <Button component={NavLink} to="/stafflogin"
            variant='contained' size='large'
            sx={theme => ({
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              },
            })}>
            Staff Login            
          </Button>
        </Box>
      </Container>

      {/* for debug       
      {import.meta.env.DEV &&
        <Box sx={{ border: 'solid 1px red', p: 2, my: 3 }}>
          <Box typography='h6'>環境參數(.env)</Box>
          <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
        </Box>}      
      */}
    </>
  )
}

//-----------------
const Jumbotron: FC = () => {
  return (
    <Paper elevation={3} sx={{ width: 'fit-content', height: 'fit-content', margin: 'auto' }}>
      <Box component='img' src="/images/banner-tropical-nights.png" alt="banner"
        sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: '100%', maxHeight: '80vh' }}></Box>
      <Box component='img' src="/images/D86C6185-0411-40DD-97F8-CB080EC03B70.jpg" alt="banner"
        sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }}></Box>
    </Paper>
  );
}
