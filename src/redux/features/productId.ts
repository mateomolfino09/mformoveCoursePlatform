import { createSlice, PayloadAction } from "@reduxjs/toolkit"; 

// Define the initial state for your slice
const initialState: any = {
  // ... Define your initial state properties here
  productId: "", // Replace with any initial value if needed (e.g., null)
};

export const productIdSlice = createSlice({
  name: "productId", // Slice name
  initialState,
  reducers: {
    setProductId: (state: any, action: PayloadAction<string>) => ({
      ...state.value,
      productId: action.payload,
    }),
  },
});

export const { setProductId } = productIdSlice.actions;
export default productIdSlice.reducer;
