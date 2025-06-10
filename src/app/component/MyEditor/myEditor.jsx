'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export default function MyEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // クリーンアップ
    useEffect(() => {
        return () => {
        editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return <div>Loading editor...</div>;
    }


  return (
    <div className='w-full'>
        <p className="text-[16px] font-bold">説明</p>
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`${editor?.isActive('bold') ? 'is-active' : ''} font-bold`} type="button" >B</button>
        <div className="w-full max-w-[600px] border border-gray-300 rounded p-4">        
            <EditorContent editor={editor} />
        </div>
    </div>
  );
}
