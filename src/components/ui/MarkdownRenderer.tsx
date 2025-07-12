// import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// import {dark, twilight, atomDark, vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'
// import Markdown from "react-markdown";

// export function MarkdownRenderer(props: { markdown: string }) {
//     const {markdown} = props
//     return (
//         <div className="">
//   <Markdown>{markdown || ""}</Markdown>
// </div>
//     )
//   return (
//     <div className="prose prose-invert max-w-none">
//         <Markdown
//             children={markdown}
//             components={{
//             code(props) {
//                 const {children, className, node, ...rest} = props
//                 const match = /language-(\w+)/.exec(className || '')
//                 return match ? (
//                 <SyntaxHighlighter
//                     {...rest}
//                     PreTag="div"
//                     children={String(children).replace(/\n$/, '')}
//                     language={match[1]}
//                     style={twilight}
//                 />
//                 ) : (
//                 <code {...rest} className={className}>
//                     {children}
//                 </code>
//                 )
//             }
//             }}
//         />
//     </div>
//   );
// }

import { marked } from "marked"

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div
      className="prose prose-invert max-w-none text-text-primary"
      dangerouslySetInnerHTML={{ __html: marked(markdown) }}
    />
  )
}