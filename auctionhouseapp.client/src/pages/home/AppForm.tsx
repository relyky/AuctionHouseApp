import { NavLink } from 'react-router'
import { Box, Container, Link, Typography } from "@mui/material";

export default function Home_AppForm() {

  return (
    <Container>
      <Typography variant='h3' gutterBottom>這是首頁</Typography>
      <Box typography='body1'>所有人的進入點</Box>

      <Box display='flex' gap={3}>

        <Link component={NavLink} to="/rafflebuyer" underline="hover" >
          抽獎券買家
        </Link>

        <Link component={NavLink} to="/backend" underline="hover" >
          工作人員(進入後台)
        </Link>

      </Box>


    </Container>
  )

}
