import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { STATES } from 'mongoose'

// Define a type for the slice state
interface User {
  id: number,
  name: string,
  email: string,
  password: string
}

interface ProfileUser {
    dbUser: User | null,
    loading: boolean
    error: any 
}


  

// Define the initial state using that type
const initialState: ProfileUser = {
    dbUser: null,
    loading: false,
    error: null
}

export const userProfileSlice = createSlice({
  name: 'userProfile',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    LOAD_USER_REQUEST: (state) => {
        state.loading = true
    },
    LOAD_USER_SUCCESS: (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.dbUser = action.payload;
    },
    LOAD_USER_FAIL: (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
    }
  },
})

export const { LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAIL } = userProfileSlice.actions


export default userProfileSlice.reducer 