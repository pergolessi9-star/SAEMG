import React, { useState } from 'react';
import { Copy, Check, Download, FileJson } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  filename?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  filename = 'eu-ai-act-audit-report.json',
}) => {
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting for JSON string
  const renderHighlightedJson = (jsonString: string) => {
    // Regex matches keys, strings, numbers, booleans, and null
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyCounter = 0;

    while ((match = regex.exec(jsonString)) !== null) {
      const matchIndex = match.index;
      // Plain text (brackets, colons, commas, whitespace)
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`plain-${keyCounter++}`} className="text-slate-400">
            {jsonString.slice(lastIndex, matchIndex)}
          </span>
        );
      }

      const token = match[0];
      if (/^"/.test(token)) {
        if (/:$/.test(token)) {
          // Object key
          const keyName = token.slice(0, -1);
          parts.push(
            <span key={`key-${keyCounter++}`} className="text-cyan-300 font-medium">
              {keyName}
            </span>
          );
          parts.push(
            <span key={`colon-${keyCounter++}`} className="text-slate-400">
              :
            </span>
          );
        } else {
          // String value
          let colorClass = 'text-emerald-300';
          if (token.includes('conforme') && !token.includes('no_conforme')) {
            colorClass = 'text-emerald-400 font-semibold';
          } else if (token.includes('parcial')) {
            colorClass = 'text-amber-300 font-semibold';
          } else if (token.includes('no_conforme')) {
            colorClass = 'text-rose-400 font-semibold';
          } else if (token.includes('no_verificable')) {
            colorClass = 'text-purple-300 font-semibold';
          }
          parts.push(
            <span key={`str-${keyCounter++}`} className={colorClass}>
              {token}
            </span>
          );
        }
      } else if (/true|false/.test(token)) {
        // Boolean
        parts.push(
          <span key={`bool-${keyCounter++}`} className="text-orange-400 font-medium">
            {token}
          </span>
        );
      } else if (/null/.test(token)) {
        // Null
        parts.push(
          <span key={`null-${keyCounter++}`} className="text-slate-500 italic">
            {token}
          </span>
        );
      } else {
        // Number
        parts.push(
          <span key={`num-${keyCounter++}`} className="text-indigo-300">
            {token}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < jsonString.length) {
      parts.push(
        <span key={`tail-${keyCounter++}`} className="text-slate-400">
          {jsonString.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const lines = formattedJson.split('\n');

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      {/* Code Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 ml-2 text-xs font-mono text-slate-300">
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>audit_report.json</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 transition border border-slate-700 active:scale-95 cursor-pointer"
            title="Copiar JSON al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 transition border border-slate-700 active:scale-95 cursor-pointer"
            title="Descargar archivo JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      {/* Code Container with line numbers */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed max-h-[500px]">
        <div className="flex">
          {/* Line Numbers */}
          <div className="select-none pr-4 text-right text-slate-600 font-mono text-xs border-r border-slate-800 mr-4">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Highlighted Content */}
          <pre className="flex-1 whitespace-pre">
            {renderHighlightedJson(formattedJson)}
          </pre>
        </div>
      </div>
    </div>
  );
};
