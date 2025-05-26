export type NoteColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: NoteColor;
  createdAt: string;
  updatedAt: string;
}

export interface NoteState {
  notes: Note[];
  folders: Folder[];
  activeFolder?: string;
  searchQuery: string;
  activeTags: string[];
  view: 'grid' | 'list';
  sortBy: 'updated' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
  showArchived: boolean;
  showDeleted: boolean;
}

export type NoteFilter = {
  search?: string;
  tags?: string[];
  folder?: string;
  showArchived?: boolean;
  showDeleted?: boolean;
  onlyPinned?: boolean;
}; 