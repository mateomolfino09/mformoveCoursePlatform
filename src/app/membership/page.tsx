import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getPlans } from '../api/payments/getPlans';
import Membership from '../../components/PageComponent/Membership/Membership';
import { Plan } from '../../../typings';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const plans = await getPlans();

  context.res.setHeader('Cache-Control', 'no-store'); // Configura el encabezado aquí

  let origin: string;
  if (process.env.NODE_ENV !== 'production') {
    origin = "https://checkout-sbx.dlocalgo.com";
  } else {
    origin = "https://checkout.dlocalgo.com";
  }

  return {
    props: {
      plans,
      origin,
    },
  };
};

interface Props {
  plans: Plan[]; // Si tienes una interfaz Plan, usa Plan[] en lugar de any[]
  origin: string;
}

export default function Page({ plans, origin }: Props) {
  return <Membership plans={plans} origin={origin} />;
}