import { Box, Button, Checkbox, Container, FormControlLabel, Grid, TextField, Typography, useEventCallback } from '@mui/material'
import { useAtom } from 'jotai'
import { adminVipAtom } from './atom'
import { useEffect } from 'react'
import useFormHand from './useFormHand'
import Swal from 'sweetalert2'

export default function EditView() {
  const [{ dataAim, formData }, setFormState] = useAtom(adminVipAtom)
  const handler = useFormHand()

  useEffect(() => {
    handler.getFormData(dataAim!.paddleNum)
  }, [])

  const handleCancel = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'List', formData: null }));
  })

  const handleRemove = useEventCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonColor: "#d33",
      cancelButtonText: "No, keep it"
    }).then((result) => {
      if (result.isConfirmed) {
        handler.delFormData(dataAim!.paddleNum);
      }
    });
  })

  return (
    <Container>
      <Typography variant='h5' gutterBottom>貴賓聯絡資料 - 修改</Typography>

      {/* for debug
      <pre>dataAim: {dataAim?.paddleNum}</pre>
      <pre>formData: {formData?.paddleNum}</pre>        
      */}

      {formData &&
        <Box component="form" onSubmit={handler.updFormSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4, md: 4, lg: 2 }}>
              <TextField label="Paddle No." name="paddleNum" variant='filled' required fullWidth
                defaultValue={formData.paddleNum}
                slotProps={{ htmlInput: { maxLength: 10, readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 8, lg: 6 }}>
              <TextField required fullWidth label="Name" name="vipName" autoFocus
                defaultValue={formData.vipName}
                slotProps={{ htmlInput: { maxLength: 100 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <TextField required fullWidth label="Email" name="vipEmail" type="email"
                defaultValue={formData.vipEmail}
                slotProps={{ htmlInput: { maxLength: 100 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField fullWidth label="Phone" name="vipPhone"
                defaultValue={formData.vipPhone}
                slotProps={{ htmlInput: { maxLength: 50 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField fullWidth label="Table No." name="tableNumber"
                defaultValue={formData.tableNumber}
                slotProps={{ htmlInput: { maxLength: 10 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField fullWidth label="Seat No." name="seatNumber"
                defaultValue={formData.seatNumber}
                slotProps={{ htmlInput: { maxLength: 10 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField fullWidth label="Receipt Header" name="receiptHeader"
                defaultValue={formData.receiptHeader}
                slotProps={{ htmlInput: { maxLength: 100 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField fullWidth label="Tax No." name="taxNum"
                defaultValue={formData.taxNum}
                slotProps={{ htmlInput: { maxLength: 20 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControlLabel label="Is Enterprise" control={
                <Checkbox name="isEnterprise" defaultChecked={formData.isEnterprise === 'Y'} />
              } />
            </Grid>
          </Grid>
          <Box display='flex' justifyContent='center' gap={2} mb={2}>
            <Button type="submit" variant="contained" color='primary'>儲存</Button>
            <Button type="button" onClick={handleRemove} variant="contained" color='warning'>刪除</Button>
            <Button type="button" onClick={handleCancel}>返回</Button>
          </Box>
        </Box>}
    </Container>
  )
}