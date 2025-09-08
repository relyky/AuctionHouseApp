import { Container } from "@mui/material";
import { useAtomValue } from 'jotai';
import { raffleSellAtom } from './atom';
import Step1View from './Step1View';
import Step2View from './Step2View';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_AppForm() {
  const { mode, formNo } = useAtomValue(raffleSellAtom);

  return (
    <Container maxWidth='xs'>
      {mode === 'Step1' && <Step1View />}
      {mode === 'Step2' && formNo && <Step2View formNo={formNo} />}
    </Container>
  )
}
