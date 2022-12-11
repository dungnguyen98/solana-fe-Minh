// ** React Imports
import { forwardRef, MouseEvent, useState, ChangeEvent } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormLabel from '@mui/material/FormLabel'
import CardHeader from '@mui/material/CardHeader'
import RadioGroup from '@mui/material/RadioGroup'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { requestApi } from 'src/configs/SetupAxios'


interface FormInputs {
  birthDate: string
  name: string
  active: string
  walletId: string
  gender: string
}

const defaultValues = {
  birthDate: '',
  name: '',
  active: '',
  walletId: '',
  gender: '',
}

const FormValidationBasic = () => {
  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInputs>({ defaultValues })

  const [data, setData] =
    useState(defaultValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onSubmit = async () => {
    const {
      birthDate,
      name,
      active,
      walletId,
      gender,
    } = data
    const result = await requestApi.post('/user/create', {
      id: 0,
      active: parseInt(active),
      birthDate,
      gender,
      name,
      walletId,
    })
    console.log(result, "res")
  }

  return (
    <Card>
      <CardHeader title='Create User' titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      name='name'
                      value={value}
                      label='Name'
                      onChange={(e) => {
                        onChange(e);
                        handleChange(e);
                      }}
                      placeholder='Name'
                      error={Boolean(errors.name)}
                      aria-describedby='validation-basic-first-name'
                    />
                  )}
                />
                {errors.name && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-first-name'>
                    This field is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='birthDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      name='birthDate'
                      value={value}
                      label='Birthday'
                      onChange={(e) => {
                        onChange(e);
                        handleChange(e);
                      }}
                      placeholder='Birthday'
                      error={Boolean(errors.birthDate)}
                      aria-describedby='validation-basic-first-name'
                    />
                  )}
                />
                {errors.birthDate && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-first-name'>
                    This field is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <Controller
                  name='walletId'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      name='walletId'
                      value={value}
                      label='Wallet ID'
                      onChange={(e) => {
                        onChange(e);
                        handleChange(e);
                      }}
                      placeholder='Wallet ID'
                      error={Boolean(errors.walletId)}
                      aria-describedby='validation-basic-first-name'
                    />
                  )}
                />
                {errors.walletId && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-first-name'>
                    This field is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl error={Boolean(errors.gender)}>
                <FormLabel>Gender</FormLabel>
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup row {...field} aria-label='gender' name='gender'
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      value={data.gender}
                    >
                      <FormControlLabel
                        value='female'
                        label='Female'
                        sx={errors.gender ? { color: 'error.main' } : null}
                        control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                      />
                      <FormControlLabel
                        value='male'
                        label='Male'
                        sx={errors.gender ? { color: 'error.main' } : null}
                        control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                      />
                      <FormControlLabel
                        value='other'
                        label='Other'
                        sx={errors.gender ? { color: 'error.main' } : null}
                        control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.gender && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-radio'>
                    This field is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl error={Boolean(errors.active)}>
                <FormLabel>Active</FormLabel>
                <Controller
                  name='active'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup row {...field} aria-label='active' name='active'
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      value={data.active}
                    >
                      <FormControlLabel
                        value={1}
                        label='Active'
                        sx={errors.active ? { color: 'error.main' } : null}
                        control={<Radio sx={errors.active ? { color: 'error.main' } : null} />}
                      />
                      <FormControlLabel
                        value={0}
                        label='Inactive'
                        sx={errors.active ? { color: 'error.main' } : null}
                        control={<Radio sx={errors.active ? { color: 'error.main' } : null} />}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.active && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-radio'>
                    This field is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button size='large' type='submit' variant='contained'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationBasic
