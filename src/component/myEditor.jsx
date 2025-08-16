'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export default function MyEditor({ content = '', onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'イベント詳細を入力してください…',
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: content || '', // null防止
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className='w-[100%]'>
            <p className="text-[14px] font-bold">イベント詳細</p>
            <div className="w-[100%] bg-[#fff] rounded p-4 text-[16px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
