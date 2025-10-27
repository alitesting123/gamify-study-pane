// src/components/NoteEditor.tsx
// Full-page note editor with markdown support and highlighting

import { useState, useEffect } from 'react';
import { useNotesContext } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Edit3,
  Eye,
  Trash2,
  Calendar,
  Tag,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { NotesEditor } from './NotesEditor';

export const NoteEditor = () => {
  const { notes, selectedNoteId, updateNote, deleteNote, selectNote } = useNotesContext();
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const [editMode, setEditMode] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setHasUnsavedChanges(false);
    }
  }, [selectedNote]);

  const handleSave = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { title, content });
      setHasUnsavedChanges(false);
      toast.success('Note saved successfully');
    }
  };

  const handleDelete = () => {
    if (selectedNote && confirm('Are you sure you want to delete this note?')) {
      deleteNote(selectedNote.id);
      toast.success('Note deleted');
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
  };

  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-2">
          <Edit3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-semibold text-muted-foreground">No note selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a note from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="p-4 space-y-3">
          {/* Title */}
          {editMode ? (
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-2xl font-bold border-none focus-visible:ring-0 px-0 h-auto"
              placeholder="Note title"
            />
          ) : (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(selectedNote.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(selectedNote.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}

              <Button
                size="sm"
                variant={editMode ? 'default' : 'outline'}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {selectedNote.tags && selectedNote.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex gap-1">
                {selectedNote.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {editMode ? (
          <div className="p-6">
            <NotesEditor
              content={content}
              onChange={handleContentChange}
              noteId={selectedNote.id}
            />
          </div>
        ) : (
          <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Customize markdown rendering for better highlighting
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mt-6 mb-4 border-b pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-4 leading-7" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                  ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-primary hover:underline" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-primary" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic text-muted-foreground" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="border-t p-2 bg-muted/50">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span><kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">S</kbd> to save</span>
          <span><kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">E</kbd> to toggle edit/preview</span>
        </div>
      </div>
    </div>
  );
};
