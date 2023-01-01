import {
    LOAD_COURSE_FAIL,
    LOAD_COURSE_REQUEST,
    LOAD_COURSE_SUCCESS,
    Action,
    CourseModal,
    CLOSE_COURSE
  } from "./courseModalTypes"


const initialState: CourseModal = {
  dbCourse: null,
  activeModal: false,
  error: false,
  loading: false
}

  
  export const courseModalReducer = (state: CourseModal = initialState, action: Action) => {
    switch (action.type) {
      case LOAD_COURSE_REQUEST:
        return { loading: true }
      case LOAD_COURSE_SUCCESS:
        return { loading: false, dbCourse: action.payload, activeModal: true }
      case LOAD_COURSE_FAIL:
        return { loading: false, error: action.payload }
      case CLOSE_COURSE:
        return { loading: false,  activeModal: false}
      default:
      return state
    }
  }
  