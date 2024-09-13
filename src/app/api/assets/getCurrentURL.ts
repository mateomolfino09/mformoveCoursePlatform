import { headers } from "next/headers";

export function getCurrentURL(): string {
    let origin;
    if (process.env.NODE_ENV != 'production') {
        origin = "http://localhost:3000"
      } else {
        origin = "https://www.mateomove.com"
      }      
    return origin;
}

