import { IndividualClass, Question } from "../../../../typings";
import IndividualClassPage from "../../../components/PageComponent/ClassPage/IndividualClass";
import LibrarySearch from "../../../components/PageComponent/LibrarySearch/LibrarySearch";
import connectDB from "../../../config/connectDB";
import { getClassById } from "../../api/individualClass/getClassById";
import { getQuestionsFromClass } from "../../api/individualClass/getAllQuestions";
import User from '../../../models/userModel';
import IndividualClasses from '../../../models/individualClassModel';
import ClassFilters from '../../../models/classFiltersModel';
export default async function Page({ params }: { params: { id: string }}) {
    connectDB();
    const { id } = params;

    const clase: IndividualClass = await getClassById(id);
    const questions: Question[] | undefined = await getQuestionsFromClass(clase._id)
    return (
    <IndividualClassPage clase={clase} questions={questions}/>
  );
}