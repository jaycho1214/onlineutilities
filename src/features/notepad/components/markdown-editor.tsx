"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, lazy, Suspense } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

// Lazy load the MDXEditor to reduce initial bundle size
const MDXEditorLazy = lazy(async () => {
  const {
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
  } = await import("@mdxeditor/editor");
  
  interface MDXEditorProps {
    ref?: React.Ref<MDXEditorMethods>;
    markdown: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    contentEditableClassName?: string;
    autoFocus?: boolean;
  }
  
  return {
    default: (props: MDXEditorProps) => (
      <MDXEditor
        {...props}
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
              sql: "SQL",
              yaml: "YAML",
              xml: "XML",
              go: "Go",
              rust: "Rust",
              java: "Java",
              c: "C",
              cpp: "C++",
              csharp: "C#",
              php: "PHP",
              ruby: "Ruby",
              swift: "Swift",
            },
          }),
          diffSourcePlugin({ viewMode: "rich-text" }),
        ]}
      />
    ),
  };
});
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
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">
                Loading editor...
              </div>
            </div>
          }
        >
          <MDXEditorLazy
            ref={editorRef}
            markdown={value}
            onChange={onChange}
            placeholder={placeholder}
            className="overflow-y-auto"
            contentEditableClassName="prose prose-neutral dark:prose-invert min-h-[calc(100vh-10rem)] max-w-none"
            autoFocus
          />
        </Suspense>
      </div>
    );
  },
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
