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

      <div className="w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen">
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
                <tr key={user._id} ref={ref}>
                  <th  className="border-solid border-transparent border border-collapse  bg-gray-900/70 text-base opacity-75">
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
