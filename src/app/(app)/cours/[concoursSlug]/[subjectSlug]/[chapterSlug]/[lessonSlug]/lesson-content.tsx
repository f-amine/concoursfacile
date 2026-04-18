"use client";

export function LessonContent({ content }: { content: string }) {
  return (
    <article
      className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-headings:scroll-mt-20 prose-p:leading-[1.75] prose-p:text-foreground/85 prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-a:decoration-border hover:prose-a:decoration-foreground/50 prose-strong:font-semibold prose-code:rounded-md prose-code:bg-accent prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.8125rem] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-border prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-img:rounded-xl prose-img:shadow-sm prose-hr:border-border prose-th:text-left prose-th:font-medium"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
