import reducers from './reducers';
import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import middleware from 'next-auth/middleware';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import {
  AnyAction,
  Dispatch,
  Middleware,
  applyMiddleware,
  createStore
} from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';

const combineMiddleware = (middleware: Middleware[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const reducer = (state: any, action: any) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload
    };
    return nextState;
  } else {
    return reducers(state, action);
  }
};

const initStore = () => {
  return createStore(reducer, combineMiddleware([thunk]));
};

export const wrapper = createWrapper(initStore);

export type AppDispatch = ThunkDispatch<any, undefined, AnyAction> &
  Dispatch<AnyAction>;
