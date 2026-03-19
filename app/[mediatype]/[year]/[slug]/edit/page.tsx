import Header from "@/app/header";
import RecordItemShort from "@/components/records/record-item-short";

export default async function PostEditPage(
    props: {
        params: Promise<{ year: string; slug: string }>
    }
) {

 const params = await props.params;

  return (
    <main>
      <Header />
      <RecordItemShort year={params.year} slug={params.slug} />
    </main>
  );
}
