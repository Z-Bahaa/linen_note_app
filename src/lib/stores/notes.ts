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
  sortOrder: 'asc',
  showArchived: false,
  showDeleted: false,
  selectedNotes: new Set<string>()
};

// Create the store
function createNotesStore() {
  // Load initial state from localStorage if available
  const storedState = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const parsedState = storedState ? JSON.parse(storedState) : null;
  
  // Ensure selectedNotes is always initialized
  const initial = {
    ...initialState,
    ...parsedState,
    selectedNotes: new Set(parsedState?.selectedNotes || [])
  };
  
  const { subscribe, set, update } = writable<NoteState>(initial);

  // Save to localStorage whenever the store changes
  if (browser) {
    subscribe(state => {
      // Convert Set to Array for storage
      const stateToStore = {
        ...state,
        selectedNotes: Array.from(state.selectedNotes)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
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

    updateNoteColor: (id: string, color: Note['color']) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, color }
            : note
        )
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

    permanentlyDeleteAllTrash: () => {
      update(state => ({
        ...state,
        notes: state.notes.filter(note => !note.isDeleted)
      }));
    },

    restoreAllFromTrash: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.isDeleted
            ? { ...note, isDeleted: false, updatedAt: new Date().toISOString() }
            : note
        )
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

    toggleArchive: (id: string) => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.id === id
            ? { ...note, isArchived: !note.isArchived, updatedAt: new Date().toISOString() }
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
        showDeleted: false, // Ensure trash is hidden when showing archived
        selectedNotes: new Set() // Clear selection when toggling views
      }));
    },

    toggleDeleted: () => {
      update(state => ({
        ...state,
        showDeleted: !state.showDeleted,
        showArchived: false, // Ensure archived is hidden when showing trash
        selectedNotes: new Set() // Clear selection when toggling views
      }));
    },

    // Selection actions
    toggleNoteSelection: (id: string) => {
      update(state => {
        const newSelection = new Set(state.selectedNotes);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return { ...state, selectedNotes: newSelection };
      });
    },

    selectAllNotes: () => {
      update(state => {
        const visibleNotes = state.notes.filter(note => 
          state.showDeleted ? note.isDeleted : 
          state.showArchived ? note.isArchived && !note.isDeleted :
          !note.isArchived && !note.isDeleted
        );
        return { 
          ...state, 
          selectedNotes: new Set(visibleNotes.map(note => note.id))
        };
      });
    },

    clearSelection: () => {
      update(state => ({
        ...state,
        selectedNotes: new Set()
      }));
    },

    // Modified bulk actions to work with selection
    permanentlyDeleteSelected: () => {
      update(state => ({
        ...state,
        notes: state.notes.filter(note => !state.selectedNotes.has(note.id)),
        selectedNotes: new Set()
      }));
    },

    restoreSelected: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          state.selectedNotes.has(note.id)
            ? { ...note, isDeleted: false, updatedAt: new Date().toISOString() }
            : note
        ),
        selectedNotes: new Set()
      }));
    },

    // Add new bulk actions for archived notes
    unarchiveSelected: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          state.selectedNotes.has(note.id)
            ? { ...note, isArchived: false, updatedAt: new Date().toISOString() }
            : note
        ),
        selectedNotes: new Set()
      }));
    },

    moveSelectedToTrash: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          state.selectedNotes.has(note.id)
            ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() }
            : note
        ),
        selectedNotes: new Set()
      }));
    },

    unarchiveAll: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.isArchived && !note.isDeleted
            ? { ...note, isArchived: false, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    moveAllToTrash: () => {
      update(state => ({
        ...state,
        notes: state.notes.map(note =>
          note.isArchived && !note.isDeleted
            ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() }
            : note
        )
      }));
    },

    // Reset store
    reset: () => set({ ...initialState, selectedNotes: new Set() })
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
            return order * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          case 'created':
            return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

export const notesStoreActions = {
  subscribe: notesStore.subscribe,
  addNote: notesStore.addNote,
  updateNote: notesStore.updateNote,
  updateNoteColor: notesStore.updateNoteColor,
  deleteNote: notesStore.deleteNote,
  permanentlyDeleteNote: notesStore.permanentlyDeleteNote,
  permanentlyDeleteAllTrash: notesStore.permanentlyDeleteAllTrash,
  restoreAllFromTrash: notesStore.restoreAllFromTrash,
  restoreNote: notesStore.restoreNote,
  archiveNote: notesStore.archiveNote,
  toggleArchive: notesStore.toggleArchive,
  togglePin: notesStore.togglePin,
  toggleArchived: notesStore.toggleArchived,
  toggleDeleted: notesStore.toggleDeleted,
  setSearchQuery: notesStore.setSearchQuery,
  setView: notesStore.setView,
  toggleNoteSelection: notesStore.toggleNoteSelection,
  selectAllNotes: notesStore.selectAllNotes,
  clearSelection: notesStore.clearSelection,
  permanentlyDeleteSelected: notesStore.permanentlyDeleteSelected,
  restoreSelected: notesStore.restoreSelected,
  unarchiveSelected: notesStore.unarchiveSelected,
  moveSelectedToTrash: notesStore.moveSelectedToTrash,
  unarchiveAll: notesStore.unarchiveAll,
  moveAllToTrash: notesStore.moveAllToTrash
}; 