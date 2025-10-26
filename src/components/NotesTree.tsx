// src/components/NotesTree.tsx
// Tree structure component for displaying folders and notes

import { useState } from 'react';
import { useNotesContext } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const NotesTree = () => {
  const {
    notes,
    folders,
    selectedNoteId,
    selectNote,
    toggleFolder,
    addNote,
    addFolder,
    deleteNote,
    deleteFolder,
    updateFolder,
  } = useNotesContext();

  const [showNewNoteInput, setShowNewNoteInput] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'note' | 'folder'; id: string } | null>(null);

  const handleCreateNote = (folderId: string | null) => {
    if (newItemName.trim()) {
      addNote({
        title: newItemName,
        content: `# ${newItemName}\n\n`,
        folderId,
      });
      setNewItemName('');
      setShowNewNoteInput(null);
    }
  };

  const handleCreateFolder = (parentId: string | null) => {
    if (newItemName.trim()) {
      addFolder({
        name: newItemName,
        parentId,
        isExpanded: true,
      });
      setNewItemName('');
      setShowNewFolderInput(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'note') {
        deleteNote(itemToDelete.id);
      } else {
        deleteFolder(itemToDelete.id);
      }
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const renderFolder = (folderId: string | null, level: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === folderId);
    const childNotes = notes.filter(n => n.folderId === folderId);

    return (
      <div>
        {childFolders.map(folder => (
          <div key={folder.id}>
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
                  )}
                  style={{ paddingLeft: `${level * 16 + 8}px` }}
                >
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="p-0 h-4 w-4 flex items-center justify-center hover:bg-muted rounded"
                  >
                    {folder.isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  {folder.isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium flex-1">{folder.name}</span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => setShowNewNoteInput(folder.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  New Note
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setShowNewFolderInput(folder.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Subfolder
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setItemToDelete({ type: 'folder', id: folder.id });
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Folder
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            {folder.isExpanded && (
              <>
                {showNewNoteInput === folder.id && (
                  <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateNote(folder.id);
                        if (e.key === 'Escape') setShowNewNoteInput(null);
                      }}
                      onBlur={() => {
                        if (newItemName.trim()) handleCreateNote(folder.id);
                        else setShowNewNoteInput(null);
                      }}
                      placeholder="Note name"
                      className="h-7 text-sm"
                      autoFocus
                    />
                  </div>
                )}
                {showNewFolderInput === folder.id && (
                  <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}>
                    <Folder className="h-4 w-4 text-amber-500" />
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder(folder.id);
                        if (e.key === 'Escape') setShowNewFolderInput(null);
                      }}
                      onBlur={() => {
                        if (newItemName.trim()) handleCreateFolder(folder.id);
                        else setShowNewFolderInput(null);
                      }}
                      placeholder="Folder name"
                      className="h-7 text-sm"
                      autoFocus
                    />
                  </div>
                )}
                {renderFolder(folder.id, level + 1)}
              </>
            )}
          </div>
        ))}

        {childNotes.map(note => (
          <ContextMenu key={note.id}>
            <ContextMenuTrigger>
              <div
                className={cn(
                  'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedNoteId === note.id && 'bg-primary/10 hover:bg-primary/15'
                )}
                style={{ paddingLeft: `${level * 16 + 28}px` }}
                onClick={() => selectNote(note.id)}
              >
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm flex-1 truncate">{note.title}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setItemToDelete({ type: 'note', id: note.id });
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Note
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {showNewNoteInput === (folderId || 'root') && (
          <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${level * 16 + 28}px` }}>
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNote(folderId);
                if (e.key === 'Escape') setShowNewNoteInput(null);
              }}
              onBlur={() => {
                if (newItemName.trim()) handleCreateNote(folderId);
                else setShowNewNoteInput(null);
              }}
              placeholder="Note name"
              className="h-7 text-sm"
              autoFocus
            />
          </div>
        )}

        {showNewFolderInput === (folderId || 'root') && (
          <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${level * 16 + 28}px` }}>
            <Folder className="h-4 w-4 text-amber-500" />
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folderId);
                if (e.key === 'Escape') setShowNewFolderInput(null);
              }}
              onBlur={() => {
                if (newItemName.trim()) handleCreateFolder(folderId);
                else setShowNewFolderInput(null);
              }}
              placeholder="Folder name"
              className="h-7 text-sm"
              autoFocus
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-3 border-b space-y-2">
        <h3 className="font-semibold text-sm">My Notes</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setShowNewNoteInput('root')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Note
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setShowNewFolderInput('root')}
          >
            <FolderPlus className="h-3 w-3 mr-1" />
            Folder
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {renderFolder(null, 0)}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'folder'
                ? 'This will delete the folder and all its contents (subfolders and notes). This action cannot be undone.'
                : 'This will permanently delete this note. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
