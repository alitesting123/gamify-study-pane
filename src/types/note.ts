// src/types/note.ts
// Note and folder types for the notes feature

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null; // null means root level
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null means root level
  createdAt: string;
  isExpanded?: boolean;
}

export interface NoteTreeItem {
  type: 'folder' | 'note';
  data: Folder | Note;
  children?: NoteTreeItem[];
}
