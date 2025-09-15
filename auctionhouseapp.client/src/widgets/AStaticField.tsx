import { TextField, Grid } from "@mui/material"
import type { GridSize } from "@mui/material"

export default function AStaticField(props: {
  label: string,
  value: string | number | null | undefined,
  size: GridSize
}) {
  const { label, value, size } = props
  return (
    <Grid size={size}>
      <TextField variant="standard" size='small' fullWidth
        label={label} value={value} slotProps={{
          input: {
            readOnly: true,
          },
        }} />
    </Grid>
  )
}