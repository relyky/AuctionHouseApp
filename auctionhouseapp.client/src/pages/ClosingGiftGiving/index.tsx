import { Box, Container, LinearProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { postData } from "../../tools/httpHelper";
import GiftInventoryLister from "./GiftInventoryLister";

/**
 * 禮品清冊
 * 情境：活動尾聲，貴賓付費完後現場領取禮品。
 * 可列印成紙本讓工作人員發送已付費禮品。
 */
export default function ClosingGiftGiving() {
  const [giftList, setGiftList] = useState<IGiftInventoryResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const args: IGiftInventoryArgs = {
      paddleNum: null
    }
    postData<IGiftInventoryResult[]>('/api/ClosingGiftGiving/GiftInventory', args)
      .then(setGiftList)
      .catch(console.error)
      .finally(() => setTimeout(() => setLoading(false), 800));
  }, [])

  return (
    <Container>
      <Typography variant='h5' gutterBottom>禮品清冊</Typography>
      <Box typography='body2' color='text.secondary'>活動尾聲貴賓付費完後現場領取禮品。可列印成紙本讓工作人員發送已付費禮品。</Box>

      {loading && <LinearProgress color='info' sx={{ my: 1 }} />}

      {!loading &&
        <GiftInventoryLister giftList={giftList} />}
    </Container>
  );
}
