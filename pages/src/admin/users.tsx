import Head from "next/head";
import Header from "../../../components/Header";
import { getUsers } from "../../api/user/getUsers";
import { getSession, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { loadUser } from "../../api/user/loadUser";

interface Props {
  users: any;
}
const ShowUsers = ({ users }: Props) => {
  
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  
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

  return (
    <>
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div id="header-dummy" className="h-20"></div>
      <div className="ml-10">
        <h1 className="text-2xl mb-7">Usuarios</h1>
        {users?.map((user: any) => (
          <h2 key={user._id}>{user.name}</h2>
        ))}
      </div>
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
