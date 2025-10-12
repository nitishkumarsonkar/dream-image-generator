'use client';

import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * Simple Markdown renderer for chat messages
 * Supports: bold, italic, lists, and line breaks
 */
export default function MarkdownText({ content, className = '' }: MarkdownTextProps) {
  const renderContent = (text: string) => {
    // Split by lines to handle lists properly
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      // Check if line is a list item (starts with * or -)
      const listMatch = line.match(/^[\s]*[\*\-]\s+(.+)$/);
      
      if (listMatch) {
        inList = true;
        const listContent = listMatch[1];
        listItems.push(
          <li key={`list-${lineIndex}`} className="ml-4">
            {processInlineFormatting(listContent)}
          </li>
        );
      } else {
        // If we were in a list and now we're not, close the list
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${lineIndex}`} className="list-disc list-inside my-2 space-y-1">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        // Process the line if it's not empty
        if (line.trim()) {
          elements.push(
            <React.Fragment key={`line-${lineIndex}`}>
              {processInlineFormatting(line)}
              <br />
            </React.Fragment>
          );
        } else {
          elements.push(<br key={`br-${lineIndex}`} />);
        }
      }
    });

    // Close any remaining list
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="ul-final" className="list-disc list-inside my-2 space-y-1">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  const processInlineFormatting = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let keyIndex = 0;

    // Regex to match **bold** or *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(
          <React.Fragment key={`text-${keyIndex++}`}>
            {text.slice(currentIndex, match.index)}
          </React.Fragment>
        );
      }

      // Check if it's bold (**text**) or italic (*text*)
      if (match[2]) {
        // Bold text
        parts.push(
          <strong key={`bold-${keyIndex++}`} className="font-semibold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic text
        parts.push(
          <em key={`italic-${keyIndex++}`} className="italic">
            {match[3]}
          </em>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(
        <React.Fragment key={`text-${keyIndex++}`}>
          {text.slice(currentIndex)}
        </React.Fragment>
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  return <div className={className}>{renderContent(content)}</div>;
}
