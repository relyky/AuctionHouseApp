import { Box, Button, Container, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState, type FormEvent } from 'react';
import { auctionInputAtom } from './atom';
import useFormHand from './useFormHand';

export default function PassView() {
  const { selectedItem, currentStatus } = useAtomValue(auctionInputAtom);
  const setFormState = useSetAtom(auctionInputAtom);
  const handler = useFormHand();

  const [passedReason, setPassedReason] = useState<'NoBids' | 'BelowReserve'>('NoBids');
  const [notes, setNotes] = useState('');

  if (!selectedItem) return null;

  const currentPrice = currentStatus?.currentPrice ?? selectedItem.startingPrice;
  const hasBids = currentPrice > selectedItem.startingPrice;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handler.passItem(selectedItem.itemId, passedReason, notes || '');
  };

  const handleCancel = () => {
    setFormState(prev => ({ ...prev, mode: 'List', selectedItem: null }));
  };

  return (
    <Container maxWidth='md'>
      <Typography variant='h5' gutterBottom color="warning.main">
        流標處理 - {selectedItem.name}
      </Typography>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          ⚠️ 注意：此操作無法撤銷
        </Typography>
        <Typography variant="body2">
          確認此商品流標後，將無法再記錄競標或結標。
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" color="primary">
              <strong>商品編號:</strong> {selectedItem.itemId}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>起標價:</strong> ${selectedItem.startingPrice.toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>底價:</strong> ${selectedItem.reservePrice.toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>目前價格:</strong> ${currentPrice.toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>是否有出價:</strong> {hasBids ? '是' : '否'}
            </Typography>
          </Grid>
          {currentStatus?.bidderName && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body1">
                <strong>最高出價者:</strong> {currentStatus.bidderName} ({currentStatus.bidderID})
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <FormControl>
              <FormLabel>流標原因</FormLabel>
              <RadioGroup
                value={passedReason}
                onChange={(e) => setPassedReason(e.target.value as 'NoBids' | 'BelowReserve')}
              >
                <FormControlLabel
                  value="NoBids"
                  control={<Radio />}
                  label="無人出價"
                  disabled={hasBids}
                />
                <FormControlLabel
                  value="BelowReserve"
                  control={<Radio />}
                  label="未達底價"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="備註"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              placeholder="請說明流標原因或其他備註事項..."
            />
          </Grid>
        </Grid>

        <Box display='flex' justifyContent='center' gap={2} mb={2}>
          <Button type="submit" variant="contained" color="warning" size="large">
            確認流標
          </Button>
          <Button type="button" variant="outlined" size="large" onClick={handleCancel}>
            返回
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
