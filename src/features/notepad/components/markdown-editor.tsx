"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
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
          codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              "": "Plain Text", // Handle empty language
              text: "Plain Text",
              plain: "Plain Text",
              js: "JavaScript",
              javascript: "JavaScript",
              jsx: "JSX",
              ts: "TypeScript",
              typescript: "TypeScript",
              tsx: "TSX",
              css: "CSS",
              html: "HTML",
              python: "Python",
              py: "Python",
              bash: "Bash",
              shell: "Bash",
              sh: "Bash",
              json: "JSON",
              markdown: "Markdown",
              md: "Markdown",
              sql: "SQL",
              yaml: "YAML",
              yml: "YAML",
              xml: "XML",
              go: "Go",
              rust: "Rust",
              rs: "Rust",
              java: "Java",
              c: "C",
              cpp: "C++",
              "c++": "C++",
              csharp: "C#",
              "c#": "C#",
              cs: "C#",
              php: "PHP",
              ruby: "Ruby",
              rb: "Ruby",
              swift: "Swift",
              kotlin: "Kotlin",
              kt: "Kotlin",
              dart: "Dart",
              scala: "Scala",
              r: "R",
              matlab: "MATLAB",
              perl: "Perl",
              lua: "Lua",
              vim: "Vim",
              dockerfile: "Dockerfile",
              nginx: "Nginx",
              apache: "Apache",
              ini: "INI",
              toml: "TOML",
              conf: "Config",
              cfg: "Config",
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

    // Helper function to clean up pasted code blocks
    const handlePastePreprocess = useCallback((pastedContent: string) => {
      // Clean up code block language identifiers that might cause issues
      const cleanedContent = pastedContent
        // Handle code blocks with empty language or problematic meta attributes
        .replace(/```\s*meta=["']?[^"']*["']?\s*/g, "```text ")
        .replace(/```\s*language=["']?[^"']*["']?\s*/g, "```text ")
        .replace(/```\s*lang=["']?[^"']*["']?\s*/g, "```text ")
        // Handle common language aliases and normalize them
        .replace(/```javascript/g, "```js")
        .replace(/```typescript/g, "```ts")
        .replace(/```python/g, "```py")
        .replace(/```shell/g, "```bash")
        // Ensure code blocks have at least 'text' as language
        .replace(/```(\s*\n)/g, "```text$1")
        // Handle standalone ``` without language
        .replace(/^```$/gm, "```text");

      return cleanedContent;
    }, []);

    // Enhanced onChange handler with paste preprocessing
    const handleChange = useCallback(
      (newValue: string) => {
        // Check if this looks like a paste operation (large content change)
        if (value && newValue.length > value.length + 10) {
          const preprocessed = handlePastePreprocess(newValue);
          onChange(preprocessed);
        } else {
          onChange(newValue);
        }
      },
      [value, onChange, handlePastePreprocess],
    );

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
            onChange={handleChange}
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
