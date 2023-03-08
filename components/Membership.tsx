import Link from "next/link";
import { useState } from "react";
import { User } from "../typings";
import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  user: User | null;
}

function Membership({ user }: Props) {
  const [isBillingLoading, setBillingLoading] = useState(false);

  // const manageSubscription = () => {
  //   if (subscription) {
  //     setBillingLoading(true)
  //     goToBillingPortal()
  //   }
  // }

  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 border px-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0">
      <div className="space-y-2 py-4">
        <h4 className="">Membresía y Facturación</h4>
        <button
          //   disabled={isBillingLoading || !subscription}
          className="h-10 w-3/5 whitespace-nowrap bg-gray-300 py-2 text-sm font-medium text-black shadow-md hover:bg-gray-200 md:w-4/5"
          //   onClick={manageSubscription}
        >
          {isBillingLoading ? <LoadingSpinner /> : "Cancelar Membresía"}
        </button>
      </div>

      <div className="col-span-3">
        <div className="flex flex-col justify-between border-b border-white/10 py-4 md:flex-row">
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-[gray]">Contraseña: ********</p>
          </div>
          <div className="md:text-right">
            <Link href={"/src/user/resetEmail"}>
              <p className="membershipLink">Cambiar Email</p>
            </Link>

            <Link href={"/src/user/forget"}>
              <p className="membershipLink">Cambiar Contraseña</p>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between pt-4 pb-4 md:flex-row md:pb-0">
          <div>
            {/* <p>
              {subscription?.cancel_at_period_end
                ? 'Your membership will end on '
                : 'Your next billing date is '}
              {subscription?.current_period_end}
            </p> */}
            <p>Tu membersía terminará en Diciembre de 2023</p>
          </div>
          <div className="md:text-right">
            <p className="membershipLink">Información de Pago</p>
            <p className="membershipLink">Añadir método de pago</p>
            <p className="membershipLink">Datos de Facturación</p>
            <p className="membershipLink">Cambiar día de Facturación</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Membership;
