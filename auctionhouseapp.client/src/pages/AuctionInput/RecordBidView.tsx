import { Box, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState, type FormEvent } from 'react';
import { SelectVipWidget } from '../../widgets/SelectVipWidget';
import { auctionInputAtom } from './atom';
import useFormHand from './useFormHand';
import type { IRecordBidRequest } from '../../dto/liveAuction/IRecordBidRequest';
import type { IVipProfile } from '../../dto/IVipProfile';

export default function RecordBidView() {
  const { selectedItem, currentStatus } = useAtomValue(auctionInputAtom);
  const setFormState = useSetAtom(auctionInputAtom);
  const handler = useFormHand();

  const [paddleNum, setPaddleNum] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!selectedItem) return null;

  const currentPrice = currentStatus?.currentPrice ?? selectedItem.startingPrice;
  const suggestedBid = currentPrice + 1000; // 建議加價 $1000

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paddleNum) {
      alert('請選擇或輸入 Paddle Number');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= currentPrice) {
      alert(`出價金額必須大於目前價格 $${currentPrice.toLocaleString()}`);
      return;
    }

    const request: IRecordBidRequest = {
      itemId: selectedItem.itemId,
      paddleNum: paddleNum,
      bidAmount: amount,
      notes: notes || ''
    };

    await handler.recordBid(request);
  };

  const handleCancel = () => {
    setFormState(prev => ({ ...prev, mode: 'List', selectedItem: null }));
  };

  return (
    <Container maxWidth='md'>
      <Typography variant='h5' gutterBottom>記錄競標 - {selectedItem.name}</Typography>

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
            <Typography variant="body1" color="error.main">
              <strong>目前價格:</strong> ${currentPrice.toLocaleString()}
            </Typography>
          </Grid>
          {currentStatus?.bidderName && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="body1">
                <strong>目前出價者:</strong> {currentStatus.bidderName} ({currentStatus.bidderID})
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <SelectVipWidget
              label="Paddle Number *"
              onSelect={(vip: IVipProfile | null) => setPaddleNum(vip?.paddleNum ?? '')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              label="出價金額"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}

              helperText={`建議出價: $${suggestedBid.toLocaleString()}`}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setBidAmount(suggestedBid.toString())}
              >
                ${suggestedBid.toLocaleString()}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setBidAmount((currentPrice + 2000).toString())}
              >
                ${(currentPrice + 2000).toLocaleString()}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setBidAmount((currentPrice + 5000).toString())}
              >
                ${(currentPrice + 5000).toLocaleString()}
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="備註"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Grid>
        </Grid>

        <Box display='flex' justifyContent='center' gap={2} mb={2}>
          <Button type="submit" variant="contained" size="large">
            確認記錄
          </Button>
          <Button
            type="button"
            variant="contained"
            color="success"
            size="large"
            onClick={handleHammer}
          >
            結標
          </Button>
          <Button
            type="button"
            variant="contained"
            color="warning"
            size="large"
            onClick={handlePass}
          >
            流標
          </Button>
          <Button type="button" variant="outlined" size="large" onClick={handleCancel}>
            返回
          </Button>
        </Box>
      </Box>
    </Container>
  );

  async function handleHammer() {
    await handler.hammerItem(selectedItem.itemId);
  }

  async function handlePass() {
    setFormState(prev => ({ ...prev, mode: 'Pass' }));
  }
}
