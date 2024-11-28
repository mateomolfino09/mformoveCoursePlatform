import React from 'react'
import { IndividualClass, Question } from '../../../../typings'
import IndividualClassDisplay from './IndividualClassDisplay'

interface Props {
    clase: IndividualClass
    questions: Question[] | undefined 
}

const IndividualClassPage = ({ clase, questions }: Props) => {    
  return (
    <IndividualClassDisplay clase={clase} questions={questions}/>
  )
}

export default IndividualClassPage