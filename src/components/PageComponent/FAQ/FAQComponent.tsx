import { useState } from 'react';
import { FAQ } from '../../../../typings';
import MainSideBar from '../../MainSidebar/MainSideBar';
import React from 'react';
import Footer from '../../Footer';

interface Props {
  questions: FAQ[];
}

const FAQComponent = ({ questions }: Props) => {
  const [selectedQuestion, setSelectedQuestion] = useState<FAQ | null>(null);

  const formatAnswer = (answer: string) => {
    // Divide el texto en párrafos utilizando puntos y saltos de línea como delimitadores,
    // y elimina cualquier espacio innecesario.
    return answer
      .split(/(?:\.\s+|\n\n)/)
      .filter(paragraph => paragraph.trim() !== "")
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-gray-300 leading-relaxed">
          {paragraph.trim()}
        </p>
      ));
  };

  return (
    <MainSideBar where={'index'}>
      <div className="flex flex-col md:flex-row m-20 text-gray-200 font-light">
        {/* Sidebar */}
        <div className="">
          <h2 className="text-2xl font-semibold text-white mb-6">FAQs</h2>
          {questions?.map((x, index) => (
            <button
              key={index}
              className={`block text-left w-full py-3 px-4 mb-2 rounded hover:bg-gray-700 transition-colors duration-300 ${
                selectedQuestion?.question === x.question
                  ? 'bg-gray-700 text-white font-medium'
                  : 'text-gray-400'
              }`}
              onClick={() => setSelectedQuestion(x)}
            >
              {x.question}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="w-full md:w-2/3 bg-gray-900 p-8 rounded-lg shadow-lg mt-6 md:mt-0 md:ml-8">
          {selectedQuestion ? (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                {selectedQuestion.question}
              </h3>
              <div>{formatAnswer(selectedQuestion.answer)}</div>
            </div>
          ) : (
            <p className="text-gray-500 text-lg">Selecciona la pregunta!</p>
          )}
        </div>
      </div>
      <Footer/>
    </MainSideBar>
  );
};

export default FAQComponent;
