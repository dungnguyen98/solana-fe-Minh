// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import FormValidationBasic from './FormValidationBasic'

const Users = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <FormValidationBasic />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Users
