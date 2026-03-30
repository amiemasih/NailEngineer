import ReactMarkdown from "react-markdown";

type Props = { content: string };

export function LessonMarkdown({ content }: Props) {
  return (
    <article className="lesson-md max-w-3xl">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="font-display text-2xl font-bold text-rose-900 mt-10 mb-4 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-semibold text-ink mt-6 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-mauve-600 leading-relaxed mb-4">{children}</p>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 text-mauve-600 mb-4">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 text-mauve-600 mb-4">{children}</ul>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
