import FreeSequentialProductList from '../../../components/PageComponent/FreeSequential/FreeSequentialProductList';

export default function ClasesGratisPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { lista?: string };
}) {
  const showList = searchParams?.lista === '1';

  return (
    <FreeSequentialProductList
      slug={params.slug}
      autoEnterFirstClass={!showList}
    />
  );
}
