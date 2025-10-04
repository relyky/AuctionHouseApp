import { Box, Button, Checkbox, Container, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import { useSetAtom } from 'jotai';
import { adminVipAtom } from './atom';
import useFormHand from './useFormHand';

export default function AddView() {
  const setFormState = useSetAtom(adminVipAtom);
  const handler = useFormHand()

  const handleCancel = () => {
    setFormState(prev => ({ ...prev, mode: 'List', formData: null }));
  };

  return (
    <Container>
      <Typography variant='h5' gutterBottom>貴賓聯絡資料 - 新增</Typography>

      <Box component="form" onSubmit={handler.addFormSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 2 }}>
            <TextField required fullWidth id="paddleNum" label="Paddle No." name="paddleNum" autoFocus
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 8, lg: 6 }}>
            <TextField required fullWidth id="vipName" label="Name" name="vipName"
              slotProps={{ htmlInput: { maxLength: 100 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField required fullWidth id="vipEmail" label="Email" name="vipEmail" type="email"
              slotProps={{ htmlInput: { maxLength: 100 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField fullWidth id="vipPhone" label="Phone" name="vipPhone"
              slotProps={{ htmlInput: { maxLength: 50 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField fullWidth id="tableNumber" label="Table No." name="tableNumber"
              slotProps={{ htmlInput: { maxLength: 10 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField fullWidth id="seatNumber" label="Seat No." name="seatNumber"
              slotProps={{ htmlInput: { maxLength: 10 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField fullWidth id="receiptHeader" label="Receipt Header" name="receiptHeader"
              slotProps={{ htmlInput: { maxLength: 100 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField fullWidth id="taxNum" label="Tax No." name="taxNum"
              slotProps={{ htmlInput: { maxLength: 20 } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <FormControlLabel label="Is Enterprise" control={<Checkbox name="isEnterprise" />} />
          </Grid>
        </Grid>
        <Box display='flex' justifyContent='center' gap={2} mb={2}>
          <Button type="submit" variant="contained">儲存</Button>
          <Button type="button" onClick={handleCancel}>返回</Button>
        </Box>
      </Box>
    </Container>
  );
}