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
import { PencilIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { User } from "../../../../typings";
import { UserContext } from "../../../../hooks/userContext";
import { Bill } from "../../../../typings";
import { AiOutlineUser } from "react-icons/ai";

interface Props {
  bills: Bill[];
  user: User
}
const billing = ({ bills, user }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [userCtx, setUserCtx] = useState<User>(user)

  const providerValue = useMemo(() => ({userCtx, setUserCtx}), [userCtx, setUserCtx])

  console.log(bills)

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
        <AiOutlineUser className="h-6 w-6 cursor-pointer"/>

        </Link>
      </header>
      <div className="w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen mt-24">
        
        <h1 className="text-2xl mb-8">Detalles Facturación</h1>
        <table className="min-w-full text-sm  ">
          <thead>
            <tr>
              <th className="border rounded-md text-xl px-1">Curso</th>
              <th className="border  text-xl px-1">Precio</th>
              <th className="border  text-xl px-1">Status</th>
              <th className="border  text-xl px-1">Id Pago</th>
              <th className="border  text-xl px-1">Tipo de Pago</th>
              <th className="border rounded-md  text-xl px-1">Fecha</th>
            </tr>
          </thead>
            <tbody>
              {bills.map((bill: Bill) => (
                <tr key={bill ? +bill.payment_id : 0} ref={ref}>
                  <th  className="border-solid border border-collapse  bg-gray-900/70 text-base opacity-75">
                    {bill.course.name}
                  </th>
                  <th className="border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1">{bill.course.currency} {bill.course.price}</th>
                  <th className="border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1">{bill.status
                  }</th>
                  <th className="border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1">{bill.payment_id.toString()
                  }</th>
                  <th className="border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1">{bill.payment_type.toString()
                  }</th>
                  <th className="border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1">
                    {new Date(bill.createdAt).toLocaleDateString("es-ES")}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DeleteUser isOpen={isOpen} setIsOpen={setIsOpen} />
      </>
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
  const userId = user._id
  const bills: any = await getUserBills(userId);

  console.log(bills)

  return { props: { bills, user } };
}

export default billing;
