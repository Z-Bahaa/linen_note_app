import { writable, derived } from 'svelte/store';
import type { Note, NoteState, NoteFilter } from '$lib/types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'vintage-notes-state';

// Initial state
const initialState: NoteState = {
  notes: [],
  searchQuery: '',
  activeTags: [],
  view: 'grid',
  sortBy: 'updated',
  sortOrder: 'desc',
  showArchived: false,
  showDeleted: false
};

// Create the store
function createNotesStore() {
  // Load initial state from localStorage if available
  const storedState = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial = storedState ? JSON.parse(storedState) : initialState;
  
  const { subscribe, set, update } = writable<NoteState>(initial);

  // Save to localStorage whenever the store changes
  if (browser) {
    subscribe(state => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
  }

  return {
    subscribe,
    update: (fn: (state: NoteState) => Partial<NoteState>) => {
      update(state => ({ ...state, ...fn(state) }));
    },
    
    // Note actions
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        notes: [...state.notes, newNote]
      }));
    },

    updateNote: (id: string, updates: Partial<Note>) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    deleteNote: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    permanentlyDeleteNote: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.filter(note => note.id !== id)
      }));
    },

    restoreNote: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isDeleted: false, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    archiveNote: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isArchived: true, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    unarchiveNote: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isArchived: false, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    togglePin: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    // UI state actions
    setSearchQuery: (query: string) => {
      update(state => ({ ...state, searchQuery: query }));
    },

    setActiveTags: (tags: string[]) => {
      update(state => ({ ...state, activeTags: tags }));
    },

    setView: (view: 'grid' | 'list') => {
      update(state => ({ ...state, view }));
    },

    setSort: (sortBy: 'updated' | 'created' | 'title', sortOrder: 'asc' | 'desc') => {
      update(state => ({ ...state, sortBy, sortOrder }));
    },

    toggleArchived: () => {
      update(state => ({
        ...state,
        showArchived: !state.showArchived,
        showDeleted: false // Ensure trash is hidden when showing archived
      }));
    },

    toggleDeleted: () => {
      update(state => ({
        ...state,
        showDeleted: !state.showDeleted,
        showArchived: false // Ensure archived is hidden when showing trash
      }));
    },

    // Reset store
    reset: () => set(initialState)
  };
}

export const notesStore = createNotesStore();

// Derived store for filtered and sorted notes
export const filteredNotes = derived(
  [notesStore],
  ([$store]) => {
    const { notes, searchQuery, activeTags, sortBy, sortOrder, showArchived, showDeleted } = $store;
    
    return notes
      .filter(note => {
        // First filter by view type (archived or trash)
        if (showArchived) {
          if (!note.isArchived || note.isDeleted) return false;
        } else if (showDeleted) {
          if (!note.isDeleted) return false;
        } else {
          // Normal view - show only active notes
          if (note.isArchived || note.isDeleted) return false;
        }

        // Then apply search and tag filters
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            note.title.toLowerCase().includes(searchLower) ||
            note.content.toLowerCase().includes(searchLower) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }
        if (activeTags.length > 0) {
          if (!activeTags.every(tag => note.tags.includes(tag))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'updated':
            return order * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          case 'created':
            return order * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          case 'title':
            return order * a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }
);

// Add a derived store for the current view type
export const currentViewType = derived(
  [notesStore],
  ([$store]) => {
    if ($store.showArchived) return 'archived';
    if ($store.showDeleted) return 'trash';
    return 'active';
  }
); 