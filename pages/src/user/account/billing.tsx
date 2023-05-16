import Head from "next/head";
import Link from "next/link";
import { getUserBills } from "../../../api/user/bills/getUserBills";
import { getUserFromBack } from "../../../api/user/getUserFromBack";
import { getSession, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useMemo } from "react";
import { loadUser } from "../../../api/user/loadUser";
import DeleteUser from "../../../../components/DeleteUser";
import AdmimDashboardLayout from "../../../../components/AdmimDashboardLayout";
import {
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { User } from "../../../../typings";
import { UserContext } from "../../../../hooks/userContext";
import { Bill } from "../../../../typings";
import { AiOutlineUser } from "react-icons/ai";

interface Props {
  bills: Bill[];
  user: User;
}
const Billing = ({ bills, user }: Props) => {
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

  console.log(bills);

  //   useEffect(() => {
  //         if (user === null || user.rol != "Admin") {
  //           router.push("/src/user/login");
  //         }

  //   }, [session, router]);

  function openModal() {
    setIsOpen(true);
  }

  return (
    <UserContext.Provider value={providerValue}>
      <>
        <Head>
          <title>Video Streaming</title>
          <meta name="description" content="Stream Video App" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className={`bg-[#141414]`}>
          <Link href="/src/home">
            <img
              src="/images/logoWhite.png"
              width={120}
              height={120}
              className="cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-80 hover:opacity-100"
            />
          </Link>
          <Link href="/src/user/account">
            <AiOutlineUser className="h-6 w-6 cursor-pointer" />
          </Link>
        </header>
        <div className="w-full h-[100vh] mt-8">
          <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <h1 className="text-2xl mt-4 mb-4">Cursos</h1>
                  <table className="min-w-full text-left text-sm font-light">
                    <thead className="border-b font-medium dark:border-neutral-500">
                      <tr>
                        <th scope="col" className="px-6 py-4">
                          Curso
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Precio
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-4">
                          ID Pago
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Tipo de Pago
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill: Bill) => (
                        <tr
                          key={bill ? +bill.payment_id : 0}
                          ref={ref}
                          className="border-b dark:border-neutral-500"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium">
                            {bill.course.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {bill.course.currency} {bill.course.price}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {bill.status}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {bill.payment_id.toString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {bill.payment_type.toString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {new Date(bill.createdAt).toLocaleDateString(
                              "es-ES"
                            )}
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
  const userId = user._id;
  const bills: any = await getUserBills(userId);

  console.log(bills);

  return { props: { bills, user } };
}

export default Billing;
