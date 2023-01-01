import {
  Action,
    LOAD_COURSE_FAIL,
    LOAD_COURSE_REQUEST,
    LOAD_COURSE_SUCCESS,
    CLOSE_COURSE
  } from "./courseModalTypes"
  import axios from "axios"
import { Dispatch } from "react"
import requests from "../../utils/requests"

  export const closeCourse = () => (dispatch: Dispatch<Action>) => {
    dispatch({ type: CLOSE_COURSE })
  }
  
  export const loadCourse = () => async (dispatch: Dispatch<Action>) => {
    try {
      dispatch({ type: LOAD_COURSE_REQUEST })
  
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      }
  
      const res = await fetch(requests.fetchYT);
      const data = await res.json() 
    
      // const url =  `https://www.youtube.com/embed/BbTyUo99Qvs`

      
      dispatch({
        type: LOAD_COURSE_SUCCESS,
        payload: data.items,
      })
    } catch (error: any) {
      dispatch({
        type: LOAD_COURSE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      })
    }
  }