// ** MUI Imports
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { requestApi } from 'src/configs/SetupAxios'
import TableSortSelect from 'src/pages/users/TableSortSelect'

const Users = () => {
  const router = useRouter()

  const getUsers = async() => {
    const result = await requestApi.get('/user/search?filter=id%3E0&page=1&size=10&sort=id%2Casc')
    console.log(result)
  }

  useEffect(() => {
    getUsers();
  })

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Button size='large' type='submit' variant='contained' onClick={() => router.push('/users/create')}>
          Create User
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableSortSelect />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Users
