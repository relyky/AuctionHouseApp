import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useEventCallback,
} from '@mui/material';
import { useAtom } from 'jotai';
import { closingPaymentAtom } from './atom';
import useFormHand from './useFormHand';

export default function EditView() {
  const [{ formData }, setFormState] = useAtom(closingPaymentAtom);
  const handler = useFormHand();

  const handleCancel = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'List', formData: null }));
  });

  if (!formData) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        付款狀態編輯
      </Typography>

      <Box component="form" onSubmit={handler.updFormSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="類型"
              name="type"
              variant="filled"
              fullWidth
              defaultValue={getTypeLabel(formData.type)}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
            <input type="hidden" name="type" value={formData.type} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="交易ID"
              name="transactionId"
              variant="filled"
              fullWidth
              defaultValue={formData.transactionId}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="項目名稱"
              name="name"
              variant="filled"
              fullWidth
              defaultValue={formData.name}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="總金額"
              name="amount"
              type="number"
              variant="filled"
              fullWidth
              defaultValue={formData.amount}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="已付金額"
              name="paidAmount"
              type="number"
              fullWidth
              required
              defaultValue={formData.paidAmount}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: formData.amount,
                  step: 1,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel>付款狀態</InputLabel>
              <Select name="paymentStatus" defaultValue={formData.paymentStatus} label="付款狀態">
                <MenuItem value="unpaid">未付款</MenuItem>
                <MenuItem value="partial">部分付款</MenuItem>
                <MenuItem value="paid">已付款</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="付款備註"
              name="paymentNotes"
              fullWidth
              multiline
              rows={3}
              defaultValue={formData.paymentNotes}
              placeholder="請輸入付款方式(現金/刷卡/轉帳)、收款人員等資訊"
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" gap={2} mb={2}>
          <Button type="submit" variant="contained" color="primary">
            儲存
          </Button>
          <Button type="button" onClick={handleCancel}>
            取消
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'liveAuction':
      return 'Live Auction (現場競標)';
    case 'silentAuction':
      return 'Silent Auction (靜默拍賣)';
    case 'openAsk':
      return 'Open Ask (公開募捐)';
    case 'donation':
      return 'Donation (捐款)';
    default:
      return type;
  }
}
