import "../styles/globals.css";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { wrapper } from "../redux/store";
import { CourseListContext } from "../hooks/courseListContext";
import { useMemo, useRef, useState } from "react";
import { CoursesDB } from "../typings";
import { Poppins } from "@next/font/google";
import { CoursesContext } from "../hooks/coursesContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "500"],
});

function App({ Component, ...rest }: AppProps) {
  const [listCourse, setListCourse] = useState<CoursesDB[]>([]);
  const [courses, setCourses] = useState<CoursesDB[]>([]);

  const providerValue = useMemo(
    () => ({ listCourse, setListCourse }),
    [listCourse, setListCourse]
  );
  const coursesProviderValue = useMemo(
    () => ({ courses, setCourses }),
    [courses, setCourses]
  );

  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  const key = process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY
    ? process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY
    : "";
  return (
    <main className={poppins.className}>
      <SessionProvider session={pageProps.session}>
        <Provider store={store}>
          <CourseListContext.Provider value={providerValue}>
            <CoursesContext.Provider value={coursesProviderValue}>
              <NextNProgress color="#c2c9d2" />
              <ToastContainer />
              <Component {...pageProps} />
            </CoursesContext.Provider>
          </CourseListContext.Provider>
        </Provider>
      </SessionProvider>
    </main>
  );
}

export default App;
