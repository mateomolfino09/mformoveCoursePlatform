import Head from "next/head";
import Link from "next/link";
import { getUsers } from "../../api/user/getUsers";
import { getUserFromBack } from "../../api/user/getUserFromBack";
import { getSession, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { loadUser } from "../../api/user/loadUser";
import DeleteUser from "../../../components/DeleteUser";

interface Props {
  users: any;
}
const ShowUsers = ({ users }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  let user = cookies?.user
    ? JSON.parse(cookies.user)
    : session?.user
    ? session.user
    : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        user = await loadUser(user?.email, user, "../../api/user/profile");
        if (user === null || user.rol != "Admin") {
          router.push("/src/user/login");
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    fetchData();
  }, [session, router]);

  useEffect(() => {
    if (ref.current != null) {
      console.log("ref", ref.current);
    }
  });

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={`bg-[#141414]`}>
        <Link href="/">
          <img
            alt="Logo Video Stream"
            src="https://rb.gy/ulxxee"
            width={120}
            height={120}
            className="cursor-pointer object-contain"
          />
        </Link>
        <Link href="/src/user/account">
          <img
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            // onClick={() => logoutHandler()}
          />
        </Link>
      </header>

      <div id="header-dummy" className="h-20"></div>

      <div className="px-4 py-4 lg:px-10 lg:py-6">
        <h1 className="text-2xl mb-8">Usuarios</h1>
        <table className="table-auto w-full border ">
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
                <th ref={ref} className="border  opacity-75">
                  {user.name}
                </th>
                <th className="border  opacity-75">{user.email}</th>
                <th className="border  opacity-75">{user.rol}</th>
                <th className="border  opacity-75">{user.createdAt}</th>
                <th className=" border ">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4 mt-4 mb-4"
                    onClick={openModal}
                  >
                    Eliminar
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 mt-4 mb-4">
                    Editar
                  </button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DeleteUser isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
export async function getServerSideProps() {
  const users: any = await getUsers();

  // for (let i = 0; i < users.length; i++) {
  //     // console.log(users[0].courses)

  // }
  return { props: { users } };
}

export default ShowUsers;
