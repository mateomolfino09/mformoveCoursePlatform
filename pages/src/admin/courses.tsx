import Head from "next/head";
import Link from "next/link";
import { getConfirmedUsers } from "../../api/user/getConfirmedUsers";
import { getUserFromBack } from "../../api/user/getUserFromBack";
import { getSession, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useMemo } from "react";
import { loadUser } from "../../api/user/loadUser";
import DeleteUser from "../../../components/DeleteUser";
import AdmimDashboardLayout from "../../../components/AdmimDashboardLayout";
import {
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { CoursesDB, User } from "../../../typings";
import { UserContext } from "../../../hooks/userContext";
import { getCourses } from "../../api/course/getCourses";

interface Props {
  courses: CoursesDB[];
  user: User;
}
const ShowUsers = ({ courses, user }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [userCtx, setUserCtx] = useState<User>(user);

  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  );

  useEffect(() => {
    if (user === null || user.rol != "Admin") {
      router.push("/src/user/login");
    }
  }, [session, router]);

  function openModal() {
    setIsOpen(true);
  }

  return (
    <UserContext.Provider value={providerValue}>
      <AdmimDashboardLayout>
        <>
          <Head>
            <title>Video Streaming</title>
            <meta name="description" content="Stream Video App" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="w-full h-[100vh]">
            <div className="flex flex-col">
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <h1 className="text-2xl mt-4 mb-4">Cursos</h1>
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Nombre
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Cantidad de Clases
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Duración
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Precio
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses?.map((course: CoursesDB) => (
                          <tr
                            key={user._id}
                            ref={ref}
                            className="border-b dark:border-neutral-500"
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {course.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {course.classes.length}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {Math.floor(
                                course.classes
                                  .map((c) => c.totalTime)
                                  .reduce((prev, current) => prev + current) /
                                  60 /
                                  60
                              )}{" "}
                              hrs{" "}
                              {Math.floor(
                                (course.classes
                                  .map((c) => c.totalTime)
                                  .reduce((prev, current) => prev + current) /
                                  60) %
                                  60
                              )}{" "}
                              min{" "}
                              {Math.round(
                                course.classes
                                  .map((c) => c.totalTime)
                                  .reduce((prev, current) => prev + current) %
                                  60
                              )}{" "}
                              seg
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {course.currency} {course.price}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {new Date(course.createdAt).toLocaleDateString(
                                "es-ES"
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex item-center justify-center border-solid border-transparent border border-collapse text-base">
                                <div className="w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                                  <PencilIcon />
                                </div>
                                <div className="w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse ">
                                  <TrashIcon />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </AdmimDashboardLayout>
    </UserContext.Provider>
  );
};
export async function getServerSideProps(context: any) {
  const { params, query, req, res } = context;
  const session = await getSession({ req });
  const cookies = parseCookies(context);
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user;
  const email = userCookie.email;
  const user = await getUserFromBack(email);
  const courses: any = await getCourses();
  return { props: { courses, user } };
}

export default ShowUsers;
