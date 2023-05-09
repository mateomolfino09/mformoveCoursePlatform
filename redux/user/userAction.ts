import { User } from '../../typings'
import {
  Action,
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS
} from './userTypes'
import axios from 'axios'
import { Dispatch } from 'redux'

interface Props {
  user: User
  email: string
}

export const loadUser =
  (email: string, user: User) => async (dispatch: Dispatch<Action>) => {
    try {
      dispatch({ type: LOAD_USER_REQUEST })

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const { data } = await axios.post(`api/user/profile`, { email }, config)

      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: data || user
      })
    } catch (error: any) {
      dispatch({
        type: LOAD_USER_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      })
    }
  }
