import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
    name: null,
    playlist_code: null,
    files: null,
    description: null,
    price: false,
    classesQuantity: false,
    image_url: null,
    currency: null,
    created_by: null,
    courseType: '',
    modules: {
        quantity: 0,
        breakPoints: [],
        titles: []
    },
    exam: {
        quantityOfQuestions: 0,
        approvalMin: 0,
        classId: 0,
        questions: [{
            question: '',
            answers: [],
            correctAnswerIndex: null
        }]
    }
}

export const createCourseSlice = createSlice({
    name: 'courseModal',
    initialState,
    reducers: {
        setStepOne: (state) => {
            console.log(state)
            state.activeModal = true
        },
        closeCourse: (state) => {
          state.activeModal = false
        }
    }
})

export const { setStepOne, closeCourse } = createCourseSlice.actions
export default createCourseSlice.reducer
