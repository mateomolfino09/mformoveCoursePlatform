import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
    dbCourse: null,
    dbCourses: null,
    youtubeVideo: null,
    activeModal: false,
    error: false,
    loading: false
  };

export const courseModalSlice = createSlice({
    name: 'courseModal',
    initialState,
    reducers: {
        loadCourse: (state) => {
            state.activeModal = true
        },
        closeCourse: (state) => {
          state.activeModal = false
        }
    }
})

export const { loadCourse, closeCourse } = courseModalSlice.actions
export default courseModalSlice.reducer

//   export const courseModalReducer = (
//     state: CourseModal = initialState,
//     action: Action
//   ) => {
//     switch (action.type) {
//       case LOAD_COURSE_REQUEST:
//         return { loading: true };
//       case LOAD_COURSE_SUCCESS:
//         return { loading: false, dbCourse: action.payload, activeModal: true };
//       case LOAD_COURSE_FAIL:
//         return { loading: false, error: action.payload };
//       case CLOSE_COURSE:
//         return { loading: false, activeModal: false };
//       case LOAD_COURSES_SUCCESS:
//         return { loading: false, dbCourses: action.payload };
//       default:
//         return state;
//     }
//   };