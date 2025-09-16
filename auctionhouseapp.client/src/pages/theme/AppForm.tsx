import { useTheme, Container, Typography, Box, Button, capitalize, Stack } from "@mui/material"

export default function AppForm() {
  const theme = useTheme();

  return (
    <Container>
      <Typography variant="h5" color={theme.palette.primary.main} gutterBottom>
        這是 Theme Demo 頁面
      </Typography>

      <Stack direction="row" flexWrap='wrap' sx={{ gap: 8 }}>
        <ColorShowcase color="primary" />
        <ColorShowcase color="secondary" />
        <ColorShowcase color="success" />
        <ColorShowcase color="error" />
        <ColorShowcase color="info" />
        <ColorShowcase color="warning" />
      </Stack>

      <Typography variant="h1">學海無涯永無止境 Responsive h1</Typography>
      <Typography variant="h2">學海無涯永無止境 Responsive h2</Typography>
      <Typography variant="h3">學海無涯永無止境 Responsive h3</Typography>
      <Typography variant="h4">學海無涯永無止境 Responsive h4</Typography>
      <Typography variant="h5">學海無涯永無止境 Responsive h5</Typography>
      <Typography variant="h6">學海無涯永無止境 Responsive h6</Typography>
      <Typography variant="subtitle1">學海無涯永無止境 Responsive subtitle1</Typography>
      <Typography variant="subtitle2">學海無涯永無止境 Responsive subtitle2</Typography>
      <Typography variant="body1">學海無涯永無止境 Responsive body1</Typography>
      <Typography variant="body2">學海無涯永無止境 Responsive body2</Typography>
      <Typography variant="button">學海無涯永無止境 Responsive button</Typography>
      <Typography variant="caption">學海無涯永無止境 Responsive caption</Typography>
      <Typography variant="overline">學海無涯永無止境 Responsive overline</Typography>

      {import.meta.env.DEV && <pre>theme: {JSON.stringify(theme, null, 2)}</pre>}
    </Container>
  )
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
