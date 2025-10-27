// src/components/NotesEditor.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  Type,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Palette,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotesEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId?: string;
}

const highlightColors = [
  { name: "Yellow", color: "bg-yellow-300", class: "highlight-yellow" },
  { name: "Green", color: "bg-green-300", class: "highlight-green" },
  { name: "Blue", color: "bg-blue-300", class: "highlight-blue" },
  { name: "Pink", color: "bg-pink-300", class: "highlight-pink" },
  { name: "Orange", color: "bg-orange-300", class: "highlight-orange" },
];

const headerColors = [
  { name: "Purple", color: "text-purple-500", class: "header-purple" },
  { name: "Blue", color: "text-blue-500", class: "header-blue" },
  { name: "Green", color: "text-green-500", class: "header-green" },
  { name: "Red", color: "text-red-500", class: "header-red" },
  { name: "Orange", color: "text-orange-500", class: "header-orange" },
];

export const NotesEditor = ({ content, onChange, noteId }: NotesEditorProps) => {
  const [selectedColor, setSelectedColor] = useState(highlightColors[0]);
  const [selectedHeaderColor, setSelectedHeaderColor] = useState(headerColors[0]);

  const applyFormatting = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = `${selectedColor.class} px-1 rounded`;
    span.style.backgroundColor = selectedColor.color.replace("bg-", "");

    try {
      range.surroundContents(span);
    } catch {
      // If selection spans multiple elements, wrap each piece
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    const tag = `h${level}`;
    document.execCommand("formatBlock", false, tag);

    // Apply color to the heading
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      const heading = selection.anchorNode.parentElement;
      if (heading && heading.tagName.toLowerCase() === tag) {
        heading.className = `${selectedHeaderColor.class} font-bold ${
          level === 1 ? "text-3xl mb-4" : level === 2 ? "text-2xl mb-3" : "text-xl mb-2"
        }`;
      }
    }
  };

  return (
    <Card className="border-2 border-border">
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-border pr-2">
          <Toggle
            size="sm"
            onClick={() => applyFormatting("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => applyFormatting("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => applyFormatting("underline")}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>

        {/* Highlight with Color Picker */}
        <div className="flex gap-1 border-r border-border pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Highlighter className="h-4 w-4" />
                <div className={`w-4 h-4 rounded ${selectedColor.color}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {highlightColors.map((color) => (
                <DropdownMenuItem
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className="flex items-center gap-2"
                >
                  <div className={`w-6 h-6 rounded ${color.color}`} />
                  {color.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={applyHighlight}>
            Highlight
          </Button>
        </div>

        {/* Headers with Color */}
        <div className="flex gap-1 border-r border-border pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {headerColors.map((color) => (
                <DropdownMenuItem
                  key={color.name}
                  onClick={() => setSelectedHeaderColor(color)}
                  className="flex items-center gap-2"
                >
                  <div className={`w-6 h-6 rounded ${color.color} bg-current opacity-20`} />
                  <span className={color.color}>{color.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Toggle size="sm" onClick={() => insertHeading(1)} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" onClick={() => insertHeading(2)} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" onClick={() => insertHeading(3)} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <Toggle
            size="sm"
            onClick={() => applyFormatting("insertUnorderedList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => applyFormatting("insertOrderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Editor */}
      <div
        contentEditable
        className="p-4 min-h-[400px] focus:outline-none prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => {
          const target = e.target as HTMLDivElement;
          onChange(target.innerHTML);
        }}
        onBlur={(e) => {
          const target = e.target as HTMLDivElement;
          onChange(target.innerHTML);
        }}
        style={{
          lineHeight: "1.6",
        }}
      />

      <style>{`
        .highlight-yellow { background-color: rgb(253 224 71) !important; color: rgb(113 63 18) !important; }
        .highlight-green { background-color: rgb(134 239 172) !important; color: rgb(20 83 45) !important; }
        .highlight-blue { background-color: rgb(147 197 253) !important; color: rgb(30 58 138) !important; }
        .highlight-pink { background-color: rgb(249 168 212) !important; color: rgb(131 24 67) !important; }
        .highlight-orange { background-color: rgb(253 186 116) !important; color: rgb(124 45 18) !important; }

        .header-purple { color: rgb(168 85 247) !important; }
        .header-blue { color: rgb(59 130 246) !important; }
        .header-green { color: rgb(34 197 94) !important; }
        .header-red { color: rgb(239 68 68) !important; }
        .header-orange { color: rgb(249 115 22) !important; }

        [contenteditable]:focus {
          outline: none;
        }

        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }

        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        [contenteditable] li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </Card>
  );
};
