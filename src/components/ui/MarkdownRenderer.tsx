
import { marked } from "marked"

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div
      className="prose prose-invert max-w-none text-text-primary text-base font-sans"
      dangerouslySetInnerHTML={{ __html: marked(markdown) }}
    />
  )
}