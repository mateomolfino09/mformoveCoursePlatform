import { AnyAction, applyMiddleware, createStore, Dispatch, Middleware } from "redux"
import { Action,configureStore, ThunkAction } from '@reduxjs/toolkit'
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import thunk, { ThunkDispatch } from 'redux-thunk';
import middleware from 'next-auth/middleware';
import reducers from "./reducers"



const combineMiddleware = (middleware: Middleware[]) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension")
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

const reducer = (state: any, action: any) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    }
    return nextState
  } else {
    return reducers(state, action)
  }
}

const initStore = () => {
  return createStore(reducer, combineMiddleware([thunk]))
}

export const wrapper = createWrapper(initStore)

export type AppDispatch =  ThunkDispatch<any, undefined, AnyAction> & Dispatch<AnyAction>