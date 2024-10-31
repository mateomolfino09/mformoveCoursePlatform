'use client';
import FAQComponent from '../../components/PageComponent/FAQ/FAQComponent';

import React, { useEffect, useState } from 'react';
import { MiniLoadingSpinner } from '../../components/PageComponent/Products/MiniSpinner';

export default function Page({ params }: { params: { name: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faqRes = await fetch('/api/faq/getFAQ', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
            next: { tags: ['faqs'] },
          })

        const faqData = await faqRes.json();
        // Procesa los datos aquí y actualiza el estado
        setQuestions(faqData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div> <MiniLoadingSpinner /></div>; 
  }

  return <FAQComponent questions={questions} />;
}
