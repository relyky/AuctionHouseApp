import { useAtom, useAtomValue } from "jotai";
import { giveSellAtom, giveUnitPriceAtom } from "./atom";
import { Container, Toolbar, Typography } from "@mui/material";
import { SelectVipWidget } from "../../widgets/SelectVipWidget";
import { useEventCallback } from "usehooks-ts";
import type { IVipProfile } from "../../dto/IVipProfile";

function Step1View() {
  const giveUnitPrice = useAtomValue(giveUnitPriceAtom) // 抽獎券單價
  const [{ giveOrder, vip }, setFormState] = useAtom(giveSellAtom); // 

  const handleSelect = useEventCallback((vip: IVipProfile | null) => {
    if (vip) {
      setFormState(prev => ({ ...prev, vip }))
    }
  });

  return (
    <Container maxWidth='xs'>
      {/* 銷售福袋抽獎券 */}
      <Typography variant='h5'>銷售福袋抽獎券</Typography>

      <Toolbar variant='regular' disableGutters>
        {/* 自貴賓清單查詢帶出 */}
        <SelectVipWidget onSelect={handleSelect} label='select VIP' placeholder='Paddle No/Full name' />
      </Toolbar>

      <pre>giveUnitPrice: {giveUnitPrice }</pre>
      <pre>vip: {JSON.stringify(vip)}</pre>
      <pre>giveOrder: {JSON.stringify(giveOrder)}</pre>
    </Container>
  );
}

export default Step1View;