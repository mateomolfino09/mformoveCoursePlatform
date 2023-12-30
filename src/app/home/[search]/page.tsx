import { IndividualClass } from "../../../../typings";
import HomeSearch from "../../../components/PageComponent/HomeSearch/HomeSearch";
import connectDB from "../../../config/connectDB";
import { getClasses } from "../../api/individualClass/getClasses";

export default async function Page({ params }: { params: { search: string }}) {
    connectDB();
    const { search } = params;

    const classes: IndividualClass[] = await getClasses(search);


  return (
    <HomeSearch classesDB={classes} search={search}/>
  );
}