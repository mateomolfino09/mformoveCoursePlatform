import { FAQ } from '../../../../typings';
import MainSideBar from '../../MainSidebar/MainSideBar';
import React from 'react';

interface Props {
  questions: FAQ[];
}

const FAQComponent = ({ questions }: Props) => {
  return (
    <MainSideBar where={'index'}>
      <div>holaaa</div>
    </MainSideBar>
  );
};

export default FAQComponent;
