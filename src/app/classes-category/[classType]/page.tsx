import { ClassTypes, IndividualClass } from "../../../../typings";
import ClassesCategory from "../../../components/PageComponent/ClassCategory/ClassCategory";
import HomeSearch from "../../../components/PageComponent/HomeSearch/HomeSearch";
import connectDB from "../../../config/connectDB";
import { getClassTypes } from "../../api/individualClass/getClassTypes";
import { getClasses } from "../../api/individualClass/getClasses";
import { getClassesByType } from "../../api/individualClass/getClassesByType";

export default async function Page({ params }: { params: { classType: string }}) {
    connectDB();
    const { classType } = params;

    const classes: IndividualClass[] = await getClassesByType(classType);
    const filters: ClassTypes[] = await getClassTypes();


  return (
    <ClassesCategory classesDB={classes} filters={filters} filter={classType}/>
  );
}