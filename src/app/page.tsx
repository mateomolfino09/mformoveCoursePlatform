import type { Metadata } from 'next';
import Index from '../components/PageComponent/Index';
import { pageMetadata } from '../lib/pageMetadata';
import { GLOBAL_SITE_TITLE } from '../lib/siteMetadata';

export const metadata: Metadata = pageMetadata(GLOBAL_SITE_TITLE);

export default async function Page() {
  return <Index />;
}
