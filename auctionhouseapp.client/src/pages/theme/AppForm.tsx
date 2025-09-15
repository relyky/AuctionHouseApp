import { useTheme, Container, Typography } from "@mui/material"

export default function AppForm() {
  const theme = useTheme();

  return (
    <Container>
      <Typography variant="h3" color={theme.palette.primary.main} gutterBottom>
        這是 Theme Demo 頁面
      </Typography>

      <pre>theme: {JSON.stringify(theme, null, 2)}</pre>
    </Container>
  )
}