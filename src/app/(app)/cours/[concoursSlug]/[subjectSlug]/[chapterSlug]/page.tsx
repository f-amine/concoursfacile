import { redirect } from "next/navigation";
export default async function ChapterPage({
  params,
}: {
  params: Promise<{
    concoursSlug: string;
    subjectSlug: string;
    chapterSlug: string;
  }>;
}) {
  const { concoursSlug, subjectSlug } = await params;
  redirect(`/cours/${concoursSlug}/${subjectSlug}`);
}
