import {
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
  } from "./userTypes"
  
import { Action, ProfileUser } from "./userTypes"

const initialState: ProfileUser = {
  user: null,
  error: false,
  loading: false
}
  export const profileReducer = (state: ProfileUser = initialState, action: Action) => {
    switch (action.type) {
      case LOAD_USER_REQUEST:
        return { loading: true }
      case LOAD_USER_SUCCESS:
        return { loading: false, dbUser: action.payload }
      case LOAD_USER_FAIL:
        return { loading: false, error: action.payload }
      default:
        return state
    }
  }
  