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
