import { IndividualClass, Question } from "../../../../typings";
import IndividualClassPage from "../../../components/PageComponent/ClassPage/IndividualClass";
import HomeSearch from "../../../components/PageComponent/HomeSearch/HomeSearch";
import connectDB from "../../../config/connectDB";
import { getClassById } from "../../api/individualClass/getClassById";
import { getQuestionsFromClass } from "../../api/individualClass/getAllQuestions";

export default async function Page({ params }: { params: { id: string }}) {
    connectDB();
    const { id } = params;

    const clase: IndividualClass = await getClassById(id);
    const questions: Question[] = await getQuestionsFromClass(clase._id)
    console.log(questions)

  return (
    <IndividualClassPage clase={clase} questions={questions}/>
  );
}