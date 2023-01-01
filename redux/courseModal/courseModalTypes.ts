
import { Item } from "../../typings";

export const LOAD_COURSE_REQUEST = "LOAD_COURSE_REQUEST"
export const LOAD_COURSE_SUCCESS = "LOAD_COURSE_SUCCESS"
export const LOAD_COURSE_FAIL = "LOAD_COURSE_FAIL"
export const CLOSE_COURSE = "CLOSE_COURSE"

export interface CourseModal {
    dbCourse: Item[] | null,
    activeModal: boolean,
    loading: boolean;
    error: any;


}

export type Action = {
    type: string,
    payload? : Item[] | string | boolean | undefined
  }
  