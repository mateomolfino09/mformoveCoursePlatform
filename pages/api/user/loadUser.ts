import {
  Action,
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  User
} from '../../../redux/user/userTypes'
import axios from 'axios'

interface Props {
  user: User
  email: string
}

export const loadUser = async (email: string, user: User, route: string) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const { data } = await axios.post(route, { email }, config)
    return data || user
  } catch (error: any) {
    return error.message
  }
}
