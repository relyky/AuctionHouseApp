import { Alert, Box, Button, CircularProgress, FormControlLabel, Paper, Switch, Typography, useEventCallback } from "@mui/material";
import { useState } from "react";
import Swal from "sweetalert2";
import { postData, ResponseError } from "../../tools/httpHelper";

interface ManualHammerResponse {
  hammeredCount: number;
  passedCount: number;
  totalCount: number;
  items: Array<{
    itemId: string;
    itemName: string;
    result: string;
    winnerPaddleNum: string;
    hammerPrice: number;
  }>;
}

export default function SilentAuctionPanel(props: {
  activity: ActivityEnum
}) {
  const [foolproof, setFoolproff] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleManualHammer = useEventCallback(async () => {
    try {
      // 確認對話框
      const confirmResult = await Swal.fire({
        title: '確認結標',
        html: '確定要手動結標所有過期的靜態拍賣商品嗎？<br/>此操作無法撤銷。',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定結標',
        cancelButtonText: '取消',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      });

      if (!confirmResult.isConfirmed) return;

      // 執行結標
      setLoading(true);
      const result = await postData<CommonResult<ManualHammerResponse>>('/api/SilentAuction/ManualHammer');

      if (!result.success) {
        throw new Error(result.errMsg || '結標失敗');
      }

      const data = result.data!;

      // 顯示結標結果
      if (data.totalCount === 0) {
        await Swal.fire({
          title: '沒有需要結標的商品',
          text: '目前沒有過期且未結標的商品',
          icon: 'info',
        });
      } else {
        // 準備結果明細HTML
        const itemsHtml = data.items.map(item => {
          const statusBadge = item.result === 'Hammered'
            ? '<span style="color: green;">✓ 成交</span>'
            : '<span style="color: orange;">✗ 流標</span>';
          const priceText = item.result === 'Hammered'
            ? `得標者: ${item.winnerPaddleNum} / 得標價: $${item.hammerPrice.toLocaleString()}`
            : '無人出價';
          return `<div style="text-align: left; margin: 8px 0;">
            <strong>${item.itemName}</strong> ${statusBadge}<br/>
            <small style="color: #666;">${priceText}</small>
          </div>`;
        }).join('');

        await Swal.fire({
          title: '結標完成',
          html: `
            <div style="margin-bottom: 16px;">
              <strong>總計: ${data.totalCount} 件商品</strong><br/>
              <span style="color: green;">成交: ${data.hammeredCount} 件</span> |
              <span style="color: orange;">流標: ${data.passedCount} 件</span>
            </div>
            <div style="max-height: 300px; overflow-y: auto; border-top: 1px solid #ddd; padding-top: 12px;">
              ${itemsHtml}
            </div>
          `,
          icon: 'success',
          confirmButtonText: '確定',
        });
      }

      // 重置防呆開關
      setFoolproff(false);
    } catch (error) {
      console.error('Manual hammer error:', error);
      const errMsg = error instanceof ResponseError
        ? error.message
        : error instanceof Error
        ? error.message
        : '未知錯誤';

      await Swal.fire({
        title: '結標失敗',
        text: errMsg,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  });

  // hidden
  if (props.activity !== 'silentAuction') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >4. Silent Auction Control Panel</Typography>

      {/* 自動輪播靜默拍品 */}
      <Alert severity='info' sx={{ m: 3 }}>
        Automatic Slideshow of Silent Auction Items
      </Alert>

      <Box display='flex' justifyContent='space-between' sx={{ my: 3 }}>
        <Button
          variant='contained'
          color='secondary'
          disabled={!foolproof || loading}
          onClick={handleManualHammer}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? '結標中...' : '靜默拍賣結標'}
        </Button>

        {/* 防呆: 防止手殘按下抽獎 */}
        <FormControlLabel label="Fool-proof"
          control={<Switch checked={foolproof} onChange={(_, chk) => setFoolproff(chk)} disabled={loading} />} />
      </Box>
    </Paper>
  )
}