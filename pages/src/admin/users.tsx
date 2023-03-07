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
import { PencilIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { getClassById } from "../../api/class/getClassById";
import { updateActualCourseSS } from "../../api/user/updateActualCourseSS";
import { User } from "../../../typings";
import { UserContext } from "../../../hooks/userContext";

interface Props {
  users: any;
  user: User
}
const ShowUsers = ({ users, user }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [userCtx, setUserCtx] = useState<User>(user)

  const providerValue = useMemo(() => ({userCtx, setUserCtx}), [userCtx, setUserCtx])

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

<<<<<<< HEAD
      <div className="px-4 py-4 lg:px-10 lg:py-6">
        <h1 className="text-2xl mb-8">Usuarios</h1>
        <table className="min-w-full text-sm  ">
          <thead>
            <tr>
              <th className="border  text-xl ">Nombre</th>
              <th className="border  text-xl">Email</th>
              <th className="border  text-xl">Rol</th>
              <th className="border  text-xl">Created at</th>
              <th className="border  text-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user._id}>
                <th ref={ref} className="border text-base  opacity-75">
                  {user.name}
                </th>
                <th className="border text-base  opacity-75">{user.email}</th>
                <th className="border text-base  opacity-75">{user.rol}</th>
                <th className="border text-base  opacity-75">
                  {new Date(user.createdAt).toLocaleDateString("es-ES")}
                </th>
                <th className=" border text-base py-3 px-6 text-center  ">
                  <div className="flex item-center justify-center">
                    <div className="opacity-75 w-6 mr-2 transform hover:text-blue-500 hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <div className="opacity-75 w-6 mr-2 transform hover:text-red-500 hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        onClick={openModal}
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                  </div>
                </th>
=======
        <div className="px-4 py-4 lg:px-10 lg:py-6 w-full">
          <h1 className="text-transparent text-3xl my-12 font-bold">Usuarios</h1>
          <table className="min-w-full text-sm border-solid border-transparent border border-collapse ">
            <thead>
              <tr>
                <th className="border-solid border-2 border-transparent border-collapse bg-light-red-darker text-xl ">Nombre</th>
                <th className="border-solid border-transparent border-2 border-collapse bg-light-red-darker text-xl">Email</th>
                <th className="border-solid border-transparent border-2 border-collapse bg-light-red-darker text-xl">Rol</th>
                <th className="border-solid border-transparent border-2 border-collapse  bg-light-red-darker text-xl">Fecha Creación</th>
                <th className="border-solid border-transparent border-2 border-collapse bg-light-red-darker text-xl">Actions</th>
>>>>>>> a59710e6ece7af4cae7d7fd8fbc22d833036e6fe
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user._id}>
                  <th ref={ref} className="border-solid border-transparent border border-collapse  bg-gray-900/70 text-base opacity-75">
                    {user.name}
                  </th>
                  <th className="border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75">{user.email}</th>
                  <th className="border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75">{user.rol}</th>
                  <th className="border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </th>
                  <th className=" border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75 py-3 px-6 text-center  ">
                    <div className="flex item-center justify-center border-solid border-transparent border border-collapse text-base">
                      <div className="w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                        <PencilIcon/>
                      </div>
                      <div className="w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse text-base bg-gray-900/70">
                        <TrashIcon onClick={openModal}/>
                      </div>
                    </div>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DeleteUser isOpen={isOpen} setIsOpen={setIsOpen} />
      </>
    </AdmimDashboardLayout>
    </UserContext.Provider>

  );
};
export async function getServerSideProps(context: any) {
  const { params, query, req, res } = context
  const session = await getSession({ req })
  const cookies = parseCookies(context)
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
  const email = userCookie.email   
  const user = await getUserFromBack(email)
  const users: any = await getConfirmedUsers();
  return { props: { users, user } };
}

export default ShowUsers;
