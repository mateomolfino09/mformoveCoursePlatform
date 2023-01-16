import { Courses } from "../../typings"

export const LOAD_USER_REQUEST = "LOAD_USER_REQUEST"
export const LOAD_USER_SUCCESS = "LOAD_USER_SUCCESS"
export const LOAD_USER_FAIL = "LOAD_USER_FAIL"

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
  }

  export interface ProfileUser {
    user: User | null;
    loading: boolean;
    error: any;
  }

  export type Action = {
    type: string,
    payload? : ProfileUser
  }
  