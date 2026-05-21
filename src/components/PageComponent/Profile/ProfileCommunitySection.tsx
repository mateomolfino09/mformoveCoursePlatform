'use client';

import { motion } from 'framer-motion';
import { TbMessageCircleCode } from 'react-icons/tb';
import { useEffect, useState } from 'react';
import type { CursoCommunitySnippet } from '../../../lib/cursoCommunitySnippet';
import { WHATSAPP_GROUP_LINK } from '../../../constants/community';

type Props = {
  itemVariants: {
    hidden: { opacity: number; y: number };
    visible: { opacity: number; y: number; transition: { duration: number } };
  };
  preferredSlug?: string | null;
};

export default function ProfileCommunitySection({ itemVariants, preferredSlug }: Props) {
  const [snippet, setSnippet] = useState<CursoCommunitySnippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const qs = preferredSlug ? `?slug=${encodeURIComponent(preferredSlug)}` : '';
        const res = await fetch(`/api/product/curso-community${qs}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({ snippet: null }));
        if (!cancelled) setSnippet(data?.snippet ?? null);
      } catch {
        if (!cancelled) setSnippet(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [preferredSlug]);

  if (loading) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 animate-pulse h-40"
      />
    );
  }

  if (!snippet) return null;

  /** Link fijo de la comunidad general; si el curso tiene invitación propia, esa tiene prioridad. */
  const href = snippet.invitacionGrupoWhatsapp || WHATSAPP_GROUP_LINK;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40"
    >
      <motion.div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl">
          <TbMessageCircleCode className="text-xl text-palette-sage w-6 h-6" />
        </div>
        <h2 className="text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight">
          {snippet.titulo}
        </h2>
      </motion.div>
      <p className="text-base text-palette-stone font-light mb-4 leading-relaxed">{snippet.descripcion}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] bg-palette-sage text-palette-ink border-2 border-palette-sage hover:bg-palette-steel hover:border-palette-steel transition-all duration-200 w-full md:w-auto justify-center text-center"
      >
        {snippet.ctaTexto}
      </a>
    </motion.div>
  );
}
