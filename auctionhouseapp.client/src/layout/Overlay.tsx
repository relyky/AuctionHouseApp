import type { FC } from 'react'
import { useAtomValue } from 'jotai'
import { Backdrop, CircularProgress } from '@mui/material'
import { selectAuthing } from '../atoms/staffAccountAtom';
import { blockingAtom } from '../atoms/metaAtom';

const Overlay: FC = () => {
  const blocking = useAtomValue(blockingAtom)
  const isAuthing = useAtomValue(selectAuthing)
  return (
    <Backdrop
      sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={blocking || isAuthing}
    >
      <CircularProgress color="inherit" size='6rem' />
    </Backdrop>
  )
}

export default Overlay;