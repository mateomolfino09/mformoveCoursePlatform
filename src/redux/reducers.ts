import { courseModalReducer } from './courseModal/courseModalReducer';
import { combineReducers } from 'redux';

const reducers = combineReducers({
  courseModalReducer: courseModalReducer
});

export default reducers;

export type State = ReturnType<typeof reducers>;
