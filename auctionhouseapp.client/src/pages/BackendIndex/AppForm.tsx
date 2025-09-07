import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { Box, Button, Container, Typography } from "@mui/material";
import { selectIsAuthedStaff, staffAccountAtom } from "../../atoms/staffAccountAtom";

export default function BackendIndex_AppForm() {
  const navigate = useNavigate()
  const isAuthedStaff = useAtomValue(selectIsAuthedStaff)
  const acct = useAtomValue(staffAccountAtom)

  // 工作人員需先登入。
  useEffect(() => {
    if (!isAuthedStaff) navigate('/stafflogin')
  }, [isAuthedStaff])

  return (
    <Container>
      <Box typography='h3' textAlign='center' p={3}>
        {`hi ${acct.loginUserName} 歡迎回來`}
      </Box>

      <Typography variant='h6' gutterBottom>業務</Typography>
      <Button component={NavLink} to='/raffle/sell'>銷售抽獎券</Button>
      <Button component={NavLink} to='/raffle/sellquery'>銷售查詢</Button>

      <Typography variant='h6' gutterBottom>後台</Typography>
      <Button component={NavLink} to='/backend/rafflecheck'>抽獎券銷售收費檢查</Button>
      <Button component={NavLink} to='/backend/rafflequery'>抽獎券銷售查詢</Button>

      <Box sx={{ my: 2 }}>
        {[...new Array(12)].map(
          () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,
        ).join('\n')}
      </Box>
    </Container>
  )
}
