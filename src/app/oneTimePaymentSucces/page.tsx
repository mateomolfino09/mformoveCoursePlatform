
import SuccessOneTimePayment from "../../components/PageComponent/MembershipActions/SuccessOneTimePayment";
import connectDB from "../../config/connectDB";


export default async function Page({ params }: { params: { }}) {
    connectDB();

  return (
    <>
  
        <SuccessOneTimePayment/>
    </>
  );
}