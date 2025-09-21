import { useReducer } from 'react'
import { Box, Button, capitalize, Collapse, Stack, Typography } from "@mui/material";

export default function PalettePanel() {
  const [f_open, toggleOpen] = useReducer(f => !f, false);

  return (
    <Box>
      <Button onClick={toggleOpen}>顯示調色盤</Button>
      <Collapse in={f_open}>
        <Box display='flex' gap={2} flexWrap='wrap' m={2} >
          <ColorShowcase color='primary' />
          <ColorShowcase color='secondary' />
          <ColorShowcase color='success' />
          <ColorShowcase color='error' />
          <ColorShowcase color='info' />
          <ColorShowcase color='warning' />
        </Box>
      </Collapse>
    </Box>
  );
}

//-------------------------------------
function ColorShowcase({ color }: { color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' }) {
  return (
    <Stack sx={{ gap: 2, alignItems: 'center' }}>
      <Button variant="contained" color={color}>
        {capitalize(color)}
      </Button>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="body2">light</Typography>
          <Box sx={{ bgcolor: `${color}.light`, width: 40, height: 20 }} />
        </Stack>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="body2">main</Typography>
          <Box sx={{ bgcolor: `${color}.main`, width: 40, height: 20 }} />
        </Stack>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="body2">dark</Typography>
          <Box sx={{ bgcolor: `${color}.dark`, width: 40, height: 20 }} />
        </Stack>
      </Stack>
    </Stack>
  );
}
