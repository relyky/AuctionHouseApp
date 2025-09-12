import { Alert, Box, Button, Container, Link, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { NavLink } from "react-router";
import { selectIsAuthedStaff, staffAccountAtom } from "../../atoms/staffAccountAtom";

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
        {`hi ${acct.loginUserName} 歡迎回來`}
      </Box>

      <Typography variant='h6' gutterBottom>業務</Typography>
      <Button component={NavLink} to='/raffle/sell'>銷售抽獎券</Button>
      <Button component={NavLink} to='/raffle/sellquery'>銷售查詢</Button>

      <Typography variant='h6' gutterBottom>後台</Typography>
      <Button component={NavLink} to='/backend/rafflecheck'>抽獎券銷售查驗</Button>
      <Button component={NavLink} to='/backend/rafflequery'>抽獎券銷售統計</Button>

      <Typography variant='h6' gutterBottom>前台</Typography>
      <Button component={NavLink} to='/'>前台首頁</Button>

    </Container>
  )
}
