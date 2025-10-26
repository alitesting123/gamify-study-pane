// src/contexts/NotesContext.tsx
// Context for managing notes and folders state

import { createContext, useContext, useState, ReactNode } from 'react';
import { Note, Folder } from '@/types/note';

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  selectNote: (id: string | null) => void;
  toggleFolder: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within NotesProvider');
  }
  return context;
};

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
  // Sample data for demonstration
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'folder-1',
      name: 'Mathematics',
      parentId: null,
      createdAt: new Date().toISOString(),
      isExpanded: true,
    },
    {
      id: 'folder-2',
      name: 'Calculus',
      parentId: 'folder-1',
      createdAt: new Date().toISOString(),
      isExpanded: false,
    },
    {
      id: 'folder-3',
      name: 'History',
      parentId: null,
      createdAt: new Date().toISOString(),
      isExpanded: true,
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      title: 'Linear Algebra Basics',
      content: '# Linear Algebra Basics\n\n## Vectors\nA vector is a quantity that has both magnitude and direction.\n\n## Matrices\nA matrix is a rectangular array of numbers.',
      folderId: 'folder-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['algebra', 'vectors'],
    },
    {
      id: 'note-2',
      title: 'Derivatives',
      content: '# Derivatives\n\nThe derivative represents the rate of change of a function.\n\n## Rules\n- Power rule: d/dx(x^n) = nx^(n-1)\n- Product rule: d/dx(fg) = fg\' + f\'g',
      folderId: 'folder-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['calculus', 'derivatives'],
    },
    {
      id: 'note-3',
      title: 'World War II Timeline',
      content: '# World War II Timeline\n\n## 1939\n- September 1: Germany invades Poland\n\n## 1941\n- December 7: Pearl Harbor attack',
      folderId: 'folder-3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['history', 'wwii'],
    },
    {
      id: 'note-4',
      title: 'Quick Notes',
      content: '# Quick Notes\n\nSome general notes that don\'t belong to any folder.',
      folderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      ...folderData,
      id: `folder-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isExpanded: true,
    };
    setFolders([...folders, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(folders.map(folder =>
      folder.id === id ? { ...folder, ...updates } : folder
    ));
  };

  const deleteFolder = (id: string) => {
    // Delete folder and all its subfolders and notes
    const foldersToDelete = [id];
    const getFolderChildren = (parentId: string) => {
      const children = folders.filter(f => f.parentId === parentId);
      children.forEach(child => {
        foldersToDelete.push(child.id);
        getFolderChildren(child.id);
      });
    };
    getFolderChildren(id);

    setFolders(folders.filter(f => !foldersToDelete.includes(f.id)));
    setNotes(notes.filter(n => !foldersToDelete.includes(n.folderId || '')));
  };

  const selectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  const toggleFolder = (id: string) => {
    setFolders(folders.map(folder =>
      folder.id === id ? { ...folder, isExpanded: !folder.isExpanded } : folder
    ));
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        selectedNoteId,
        addNote,
        updateNote,
        deleteNote,
        addFolder,
        updateFolder,
        deleteFolder,
        selectNote,
        toggleFolder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
