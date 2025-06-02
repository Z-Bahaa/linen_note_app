export type NoteColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gold';

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
}

export interface NoteState {
  notes: Note[];
  searchQuery: string;
  activeTags: string[];
  view: 'grid' | 'list';
  sortBy: 'updated' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
  showArchived: boolean;
  showDeleted: boolean;
  selectedNotes: Set<string>;
  tags: string[];
}

export type NoteFilter = {
  search?: string;
  tags?: string[];
  showArchived?: boolean;
  showDeleted?: boolean;
  onlyPinned?: boolean;
}; 