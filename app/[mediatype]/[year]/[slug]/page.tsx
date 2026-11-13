import Header from "@/app/header";
import RecordItem from "@/components/records/record-item";

export default async function RecordPage(props: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const params = await props.params;

  // No Suspense boundary here on purpose: RecordItem calls notFound() for
  // unknown records, and that only yields a real 404 status if it happens
  // before the response starts streaming.
  return (
    <main>
      <Header />
      <RecordItem year={params.year} slug={params.slug} />
    </main>
  );
}
