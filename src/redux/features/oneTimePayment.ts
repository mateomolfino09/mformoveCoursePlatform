import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type InitialState = {
    value: FilterState;
}

type FilterState = {
    [key: string]: any; // Index signature allowing any string keys
    token: string| null
}


const initialState : InitialState = {
  value: {
    token: null
  }
};

export const oneTymePaymentSlice = createSlice({
  name: 'oneTimePayment',
  initialState,
  reducers: {
    setOnePaymentToken: (state: any, action: PayloadAction<string>) => {
      return {
        value: {
          ...state.value,
          token: action.payload
        }
      };
    },
    clearData: () => {
        return initialState
    }
  }
});

export const {
    setOnePaymentToken,
    clearData
}= oneTymePaymentSlice.actions

export default oneTymePaymentSlice.reducer;