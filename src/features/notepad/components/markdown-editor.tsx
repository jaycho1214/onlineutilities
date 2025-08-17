"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./markdown-editor.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  ({ value, onChange, placeholder }, ref) => {
    const editorRef = useRef<MDXEditorMethods>(null);
    
    // Forward the ref
    useImperativeHandle(ref, () => editorRef.current!, []);
    
    // Update editor content when value prop changes
    useEffect(() => {
      if (editorRef.current && value !== undefined) {
        const currentMarkdown = editorRef.current.getMarkdown();
        if (currentMarkdown !== value) {
          editorRef.current.setMarkdown(value);
        }
      }
    }, [value]);
    
    return (
      <div className="mdx-editor-wrapper">
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder}
          className="overflow-y-auto"
          contentEditableClassName="prose prose-neutral dark:prose-invert min-h-[calc(100vh-10rem)]"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: "JavaScript",
                jsx: "JSX",
                ts: "TypeScript",
                tsx: "TSX",
                css: "CSS",
                html: "HTML",
                python: "Python",
                bash: "Bash",
                json: "JSON",
                markdown: "Markdown",
              },
            }),
            diffSourcePlugin({ viewMode: "rich-text" }),
          ]}
          autoFocus
        />
      </div>
    );
  },
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
