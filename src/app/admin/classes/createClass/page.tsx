import { ClassTypes } from "../../../../../typings";
import CreateClass from "../../../../components/PageComponent/CreateClass/CreateClass";
import connectDB from "../../../../config/connectDB";
import { getClassTypes } from "../../../api/individualClass/getClassTypes";

export default async function Page() {
    connectDB();
    const classTypes: ClassTypes[] = await getClassTypes();
    //Chequear performance
  
      return (
        <CreateClass classTypes={classTypes}/>
      );
    };