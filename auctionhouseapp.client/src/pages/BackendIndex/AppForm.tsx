import { Alert, Box, Button, Container, Link, Stack, Typography, Divider } from "@mui/material";
import { useAtomValue } from "jotai";
import { NavLink } from "react-router";
import { selectIsAuthedStaff, staffAccountAtom } from "../../atoms/staffAccountAtom";
import AuthorizeGuard from "../../layout/AuthorizeGuard";
import type { FC } from "react";
import LiveEventsPanel from "./LiveEventsPanel";

export default function BackendIndex_AppForm() {
  const isAuthedStaff = useAtomValue(selectIsAuthedStaff)
  const acct = useAtomValue(staffAccountAtom)

  //// 工作人員需先登入。
  //useEffect(() => {
  //  if (!isAuthedStaff) navigate('/stafflogin')
  //}, [isAuthedStaff])

  // 工作人員需先登入。
  if (!isAuthedStaff) {
    return (
      <Alert severity='error' sx={{ m: 3 }}>
        未登入請先登入。
        <Link href='/stafflogin'>工作人員登入</Link>
      </Alert>
    )
  }

  return (
    <Container>
      <Box typography='h3' textAlign='center' p={3}>
        {`hi ${acct.loginUserName}`}
      </Box>

      {/* 業務 */}
      <AuthorizeGuard role='Sales'>
        <Typography variant='h6' gutterBottom>Sales</Typography>
        <Stack gap={2} sx={{ mb: 2 }}>
          {/* 銷售抽獎券(需重刷畫面) */}
          <Button variant='text' href='/raffle/sell'>Sell Raffle Tickets</Button>

          {/* 銷售查詢 */}
          <Button component={NavLink} variant='text' to='/raffle/sellquery'>Sales Records</Button>

          {/* 銷售福袋(需重刷畫面) */}
          {import.meta.env.DEV &&
            <Button variant='text' href='/raffle/sell'>銷售福袋</Button>}

        </Stack>
      </AuthorizeGuard>

      <AuthorizeGuard role='Manager'>
        {/* 後台 */}
        <Typography variant='h6' gutterBottom>Admin</Typography>
        <Stack gap={2} sx={{ mb: 2 }}>
          {/* 抽獎券銷售查驗 */}
          <Button component={NavLink} variant='text' to='/backend/rafflecheck'>Verify Ticket Sales</Button>
          {/* 抽獎券銷售統計 */}
          <Button component={NavLink} variant='text' to='/backend/rafflequery'>Sales Statistics</Button>
        </Stack>
      </AuthorizeGuard>

      {/* 現場活動 */}
      {import.meta.env.DEV && <LiveEventsPanel />}

      {/*
      <Typography variant='h6' gutterBottom>前台</Typography>
      <Button component={NavLink} to='/'>前台首頁</Button>        
      */}

      <Box sx={{ height: 50 }} ></Box>
      <Footer />
    </Container>
  )
}


//-------------------------------------
const appVersion = import.meta.env.VITE_APP_VERSION;

const Footer: FC = () => (
  <Box
    component="footer"
    sx={{
      mt: 1,
      py: .25,
      textAlign: 'center',
      borderTop: '1px solid #ddd',
      position: 'fixed',
      bottom: 0,
      left: '3rem',
      right: '3rem',
    }}
  >
    {/* <Typography variant="body2" color="text.secondary">
      ©2025 慈善拍賣系統 保留所有權利。
    </Typography> */}
    <Typography variant="caption" color="text.disabled">
      Version {appVersion}
    </Typography>
  </Box>
);
