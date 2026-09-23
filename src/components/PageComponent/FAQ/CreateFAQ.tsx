'use client';

import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from '../../../hooks/useToast';
import { AdminPage, AdminPageHeader, AdminInput, AdminTextarea, AdminButton } from '../../admin';

const CreateFAQ = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const config = {
    cache: 'no-store',
    headers: {
      'Cache-Control':
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    },
    next: { tags: ['faqs'] }
  };

  const handleCreateFAQ = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(
        '/api/preguntas-frecuentes/createFAQ',
        {
          question,
          answer
        },
        config
      );

      auth.fetchUser();
      toast.success(data.message);
      setQuestion('');
      setAnswer('');
    } catch {
      toast.error('No se pudo crear la pregunta frecuente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Preguntas frecuentes"
        description="Creá una pregunta y su respuesta para el sitio."
      />
      <form className="max-w-xl space-y-4" autoComplete="off" onSubmit={handleCreateFAQ}>
        <AdminInput
          label="Pregunta"
          type="text"
          name="question"
          placeholder="Escribe la pregunta"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <AdminTextarea
          label="Respuesta"
          name="answer"
          placeholder="Escribe la respuesta"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
        <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] pt-4">
          <AdminButton type="button" variant="ghost" onClick={() => router.push('/admin/preguntas-frecuentes')}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" variant="primary" loading={saving}>
            Crear
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
};

export default CreateFAQ;
