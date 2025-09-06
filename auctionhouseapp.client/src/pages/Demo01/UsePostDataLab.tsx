import { useState } from "react";
import { Box, Button, useEventCallback } from "@mui/material";
import { postData } from "../../tools/httpHelper";

export default function UsePostDataLab() {
  const [info, setInfo] = useState<any>()

  const handlePostData = useEventCallback(async () => {
    const userId = 'smart'
    const info = await postData(`api/WeatherForecast/GetFormData/${userId}`);
    setInfo(info);
  });

  return (
    <Box mb={2}>
      <Box typography='h5'>UsePostDataLab</Box>

      <Button onClick={handlePostData}>postData</Button>
      {info && <pre>{JSON.stringify(info, null, 2)}</pre>}
      {info && <pre>{JSON.stringify(["abc","def","foo"], null, 2)}</pre>}
    </Box>
  )
}