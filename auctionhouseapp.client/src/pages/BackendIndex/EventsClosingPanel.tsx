import { Box, Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router";

export default function LiveEventsView() {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Paper square sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>活動尾聲</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button component={NavLink} fullWidth variant='outlined' to='/closing/payment'>
              結帳項目註記
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button component={NavLink} fullWidth variant='outlined' to='/closing/giftgiving'>
              禮品清冊
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}