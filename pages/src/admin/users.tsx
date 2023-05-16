import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { getConfirmedUsers } from "../../api/user/getConfirmedUsers";
import { getUserFromBack } from "../../api/user/getUserFromBack";
import { getSession, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import DeleteUser from "../../../components/DeleteUser";
import AdmimDashboardLayout from "../../../components/AdmimDashboardLayout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { User } from "../../../typings";
import { UserContext } from "../../../hooks/userContext";

interface Props {
  users: any;
  user: User;
}
const ShowUsers = ({ users, user }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const ref = useRef(null);
  const [userCtx, setUserCtx] = useState<User>(user);

  const [userSelected, setUserSelected] = useState<User>(user);
  const [elementos, setElementos] = useState<User[]>([]);

  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  );

  useEffect(() => {
    if (user === null || user.rol != "Admin") {
      router.push("/src/user/login");
    }
  }, [session, router]);
  useEffect(() => {
    setElementos(users);
  }, []);

  const deleteUser = async () => {
    const userId = userSelected?._id;

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await axios.delete(`/api/user/delete/${userId}`, config);
    const updatedUsers = users.filter(
      (person: User) => person._id !== userSelected._id
    );
    setElementos(updatedUsers);
    if (response) {
      toast.success(`${userSelected.name} fue eliminado correctamente`);
    }

    setIsOpenDelete(false);
  };
  function openModalDelete(user: User) {
    setUserSelected(user);
    setIsOpenDelete(true);
  }
  function openEdit(user: User) {
    setUserSelected(user);
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
                    <h1 className="text-2xl mt-4 mb-4">Usuarios</h1>
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Nombre
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Rol
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Creado
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {elementos?.map((user: any) => (
                          <tr className="border-b dark:border-neutral-500" key={user.id}>
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {user.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {user.email}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {user.rol}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {new Date(user.createdAt).toLocaleDateString(
                                "es-ES"
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex item-center justify-center border-solid border-transparent border border-collapse text-base">
                                <div className="w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                                  <Link
                                    href={`/src/admin/updateUser/${user._id}`}
                                  >
                                    <PencilIcon
                                      onClick={() => openEdit(user)}
                                    />
                                  </Link>
                                </div>
                                <div className="w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse ">
                                  <TrashIcon
                                    onClick={() => openModalDelete(user)}
                                  />
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
          <DeleteUser
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            user={userSelected}
            deleteUser={deleteUser}
          />
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
  const users: any = await getConfirmedUsers();
  return { props: { users, user } };
}

export default ShowUsers;
