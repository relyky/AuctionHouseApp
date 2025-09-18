import type { GridSize } from '@mui/material';
import { Box, Grid } from '@mui/material';

export default function AGridField(props: {
  label: string,
  value: string | number | null | undefined,
  size: GridSize
}) {
  const { label, value, size } = props
  return (
    <Grid size={size}>
      <Box typography='caption' color='text.secondary'>{label}</Box>
      <Box typography='body1' color='text.primary' sx={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
        {value}
      </Box>
    </Grid>
  )
}