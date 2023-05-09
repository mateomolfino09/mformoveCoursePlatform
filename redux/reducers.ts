import { courseModalReducer } from './courseModal/courseModalReducer'
import { profileReducer } from './user/userReducer'
import { combineReducers } from 'redux'

const reducers = combineReducers({
  profile: profileReducer,
  courseModalReducer: courseModalReducer
})

export default reducers

export type State = ReturnType<typeof reducers>
