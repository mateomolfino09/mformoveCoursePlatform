import { Courses, Item } from '../../../typings';

export const LOAD_COURSE_REQUEST = 'LOAD_COURSE_REQUEST';
export const LOAD_COURSE_SUCCESS = 'LOAD_COURSE_SUCCESS';
export const LOAD_COURSE_FAIL = 'LOAD_COURSE_FAIL';
export const LOAD_COURSES_SUCCESS = 'LOAD_COURSES_SUCCESS';
export const CLOSE_COURSE = 'CLOSE_COURSE';

export interface CourseModal {
  dbCourses: Courses[] | null;
  dbCourse: Item[] | null;
  youtubeVideo: Item[] | null;
  activeModal: boolean;
  loading: boolean;
  error: any;
}

export type Action = {
  type: string;
  payload?: Item[] | string | boolean | undefined;
};
