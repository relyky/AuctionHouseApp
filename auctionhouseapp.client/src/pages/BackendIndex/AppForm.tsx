import { Alert, Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useState, type FC } from "react";
import { NavLink } from "react-router";
import { selectIsAuthedStaff, staffAccountAtom } from "../../atoms/staffAccountAtom";
import AuthorizeGuard from "../../layout/AuthorizeGuard";
import LiveEventsPanel from "./LiveEventsPanel";
import EventsClosingPanel from "./EventsClosingPanel";
import { postData } from "../../tools/httpHelper";

export default function BackendIndex_AppForm() {
  const isAuthedStaff = useAtomValue(selectIsAuthedStaff)
  const acct = useAtomValue(staffAccountAtom)

  const [eventClosing, setEventClosing] = useState<boolean>(false) // 活動尾聲
  const [loading, setLoading] = useState<boolean>(false)

  //// 工作人員需先登入。
  //useEffect(() => {
  //  if (!isAuthedStaff) navigate('/stafflogin')
  //}, [isAuthedStaff])

  useEffect(() => {
    setLoading(true)
    postData<MsgObj>('/api/Site/GetEventClosingSwitch')
      .then(msg => setEventClosing(msg.message === "on"))
      .catch(console.log)
      .finally(() => setLoading(false))
  }, []) 

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
          {/* 銷售抽獎券 */}
          <Button component={NavLink} variant='text' to='/raffle/sell'>Sell Raffle Tickets</Button>

          {/* 銷售查詢 */}
          <Button component={NavLink} variant='text' to='/raffle/sellquery'>Sales Records</Button>

          {/* 銷售福袋抽獎券 */}
          <Button component={NavLink} variant='text' to='/give/sell'>Sell Give-to-Win Tickets</Button>

          {/* 銷售福袋紀錄 */}
          <Button component={NavLink} variant='text' to='/give/sellquery'>Sales Records (Give-to-Win)</Button>

        </Stack>
      </AuthorizeGuard>

      <AuthorizeGuard role='Manager'>
        {/* 後台 */}
        <Typography variant='h6' gutterBottom>Admin</Typography>
        <Stack gap={2} sx={{ mb: 2 }}>
          {/* 抽獎券銷售查驗 */}
          <Button component={NavLink} variant='text' to='/backend/rafflecheck'>Verify Ticket Sales</Button>

          {/* 銷售福袋 */}
          <Button component={NavLink} variant='text' to='/backend/givecheck'>Verify Ticket Sales (Give-to-Win)</Button>

          {/* 抽獎券銷售統計 */}
          <Button component={NavLink} variant='text' to='/backend/rafflequery'>Sales Statistics</Button>

        </Stack>
      </AuthorizeGuard>

      {/* 現場活動 */}
      <LiveEventsPanel />

      {/* 活動尾聲 */}
      {eventClosing && <EventsClosingPanel />}

      <Box sx={{ height: '6rem' }} ></Box>
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
