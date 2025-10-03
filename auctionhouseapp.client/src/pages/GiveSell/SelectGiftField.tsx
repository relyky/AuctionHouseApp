import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { postData } from "../../tools/httpHelper";
import type { IGivePrizeProfile } from "../../dto/display/IGivePrizeProfile";

export default function SelectGiftField(props: {
  name: string
  value: string
  label: string
  onChange: (value: string) => void
  readOnly: boolean
  required: boolean
}) {
  const [profileList, setProfileList] = useState<IGivePrizeProfile[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = (event: SelectChangeEvent) => {
    props.onChange(event.target.value as string);
  }

  useEffect(() => {
    // ¨ú±o Profile ²M¥U
    setLoading(true)
    postData<IGivePrizeProfile[]>('/api/GiveSell/ListGivePrizeProfile')
      .then(setProfileList)
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [])

  return (

    <FormControl fullWidth>
      <InputLabel>{props.label}</InputLabel>
      <Select
        name={props.name}
        value={props.value}
        onChange={handleChange}
        label={props.label}
        readOnly={props.readOnly}
        required={props.required}
        disabled={loading}
      >
        {profileList.map((item) => (
          <MenuItem key={item.giftId}
            value={item.giftId}>
            {`${item.giftId}.${item.name}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
