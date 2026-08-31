import React from 'react';

interface MarkdownOutputProps {
  content: string;
  className?: string;
}

export const MarkdownOutput: React.FC<MarkdownOutputProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines into structured blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      const items = [...listBuffer];
      listBuffer = [];
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2.5 space-y-1.5 list-none pl-0">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
              <span className="text-sky-400 text-[10px] mt-1 shrink-0">✦</span>
              <div>{renderInlineFormatting(item)}</div>
            </li>
          ))}
        </ul>
      );
    }
  }

  function renderInlineFormatting(text: string): React.ReactNode {
    // Process code blocks `...`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-4 border-t border-slate-800/80" />
      );
      continue;
    }

    // Heading 3 (### Heading)
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace(/^###\s+/, '');
      elements.push(
        <div key={`h3-${i}`} className="mt-4 mb-2 first:mt-0">
          <h4 className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
            {renderInlineFormatting(title)}
          </h4>
        </div>
      );
      continue;
    }

    // Heading 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      flushList();
      const title = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3 key={`h2-${i}`} className="text-sm font-extrabold text-white mt-4 mb-2 first:mt-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          {renderInlineFormatting(title)}
        </h3>
      );
      continue;
    }

    // Heading 1 (# Heading)
    if (trimmed.startsWith('# ')) {
      flushList();
      const title = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h2 key={`h1-${i}`} className="text-base font-extrabold text-white mt-4 mb-2 first:mt-0">
          {renderInlineFormatting(title)}
        </h2>
      );
      continue;
    }

    // Blockquote (> Quote)
    if (trimmed.startsWith('> ')) {
      flushList();
      const quote = trimmed.replace(/^>\s+/, '');
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2.5 p-3 rounded-r-xl border-l-2 border-sky-400 bg-sky-500/5 text-xs text-slate-200 italic leading-relaxed"
        >
          {renderInlineFormatting(quote)}
        </blockquote>
      );
      continue;
    }

    // List item (•, *, -)
    if (/^[\*\-\•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[\*\-\•]\s+/, '');
      listBuffer.push(itemText);
      continue;
    }

    // Standard Paragraph line
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed my-1.5">
        {renderInlineFormatting(rawLine)}
      </p>
    );
  }

  flushList();

  return (
    <div className={`space-y-1 ${className}`}>
      {elements}
    </div>
  );
};
