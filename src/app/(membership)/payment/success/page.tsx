import { IndividualClass, Question } from "../../../../../typings";
import IndividualClassPage from "../../../../components/PageComponent/ClassPage/IndividualClass";
import LibrarySearch from "../../../../components/PageComponent/LibrarySearch/LibrarySearch";
import connectDB from "../../../../config/connectDB";
import { getClassById } from "../../../api/individualClass/getClassById";
import { getQuestionsFromClass } from "../../../api/individualClass/getAllQuestions";
import Success from "../../../../components/PageComponent/MembershipActions/Success";

export default async function Page({ params }: { params: { }}) {
    connectDB();

  return (
    <>
        <Success />
    </>
  );
}