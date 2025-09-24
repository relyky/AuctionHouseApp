
/**
 * 快速選取貴賓 Profile
 */

import { Autocomplete, styled, TextField, useEventCallback } from "@mui/material";
import type { IVipProfile } from "../dto/IVipProfile";
// icons
import { useEffect, useState } from "react";
import { postData } from "../tools/httpHelper";

export function SelectVipWidget(props: {
  label?: string
  placeholder?: string
  onSelect: (vip: IVipProfile | null) => void
}) {
  const [profileList, setProfileList] = useState<IVipProfile[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = useEventCallback((_, value: IVipProfile | null) => {
    props.onSelect(value)
  });

  //const handleChange = useEventCallback((_, value: IVipProfile | null) => {
  //  console.log('handleChange', value)
  //  if (value) {
  //    // 有選值, 送回完整 VIP 資料
  //    postData<IVip>(`/api/GiveSell/GetVip/${value.paddleNum}`)
  //      .then(vip => props.onSelect(vip))
  //      .catch(console.log)
  //  } else {
  //    // 選空值
  //    props.onSelect(null)
  //  }
  //});

  useEffect(() => {
    // 取得 Profile 清冊
    setLoading(true)
    postData<IVipProfile[]>('/api/GiveSell/ListVipProfile')
      .then(setProfileList)
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Autocomplete<IVipProfile> disablePortal fullWidth
      onChange={handleChange}
      loading={loading}
      options={profileList}
      getOptionLabel={(option) => `${option.paddleNum}.${option.vipName}`}
      renderInput={(params) => <StyledTextField {...params}
        label={props.label}
        placeholder={props.placeholder}
      />}
    />
  );
}

//------
const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '25px',
  },
  '& .MuiOutlinedInput-input': {
    paddingLeft: '25px',
    paddingRight: '25px'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderRadius: '25px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderRadius: '25px',
  },
}));
