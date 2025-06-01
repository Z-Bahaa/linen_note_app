<script lang="ts">
  import { notesStore, filteredNotes, currentViewType } from '$lib/stores/notes';
  import Note from './Note.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import { fade } from 'svelte/transition';
  import type { Note as NoteType } from '$lib/types';

  let editingNoteId: string | null = null;
  let showConfirmModal = false;
  let noteToConfirm: NoteType | null = null;
  let confirmAction: string | null = null;

  $: pinnedNotes = $filteredNotes.filter(note => note.isPinned);
  $: unpinnedNotes = $filteredNotes.filter(note => !note.isPinned);

  function handleNoteAction(action: string, note: NoteType) {
    switch (action) {
      case 'delete':
        noteToConfirm = note;
        confirmAction = 'delete';
        showConfirmModal = true;
        break;
      case 'restore':
        noteToConfirm = note;
        confirmAction = 'restore';
        showConfirmModal = true;
        break;
      case 'archive':
        noteToConfirm = note;
        confirmAction = 'archive';
        showConfirmModal = true;
        break;
      case 'toggleArchive':
        notesStore.toggleArchive(note.id);
        break;
      case 'togglePin':
        notesStore.togglePin(note.id);
        break;
      case 'select':
        notesStore.toggleNoteSelection(note.id);
        break;
    }
  }

  function handleConfirm() {
    if (!noteToConfirm || !confirmAction) return;
    
    switch (confirmAction) {
      case 'delete':
        if ($currentViewType === 'trash') {
          notesStore.permanentlyDeleteNote(noteToConfirm.id);
        } else {
          notesStore.deleteNote(noteToConfirm.id);
        }
        break;
      case 'restore':
        notesStore.restoreNote(noteToConfirm.id);
        break;
      case 'archive':
        notesStore.archiveNote(noteToConfirm.id);
        break;
    }
    
    noteToConfirm = null;
    confirmAction = null;
    showConfirmModal = false;
  }

  function handleCancel() {
    noteToConfirm = null;
    confirmAction = null;
    showConfirmModal = false;
  }

  function handleColorChange(note: NoteType, color: NoteType['color']) {
    notesStore.updateNote(note.id, { color });
  }

  function handleNoteUpdate(note: NoteType, updates: Partial<NoteType>) {
    notesStore.updateNote(note.id, updates);
    if (editingNoteId === note.id) {
      editingNoteId = null;
    }
  }
</script>

{#if $currentViewType === 'active'}
  {#if pinnedNotes.length > 0}
    <div class="notes-section">
      <h2 class="section-heading">Pinned</h2>
      <div class="notes-container" class:list-view={$notesStore.view === 'list'}>
        {#each pinnedNotes as note (note.id)}
          <div
            class="note-wrapper"
            class:pinned={note.isPinned}
            class:selected={$notesStore.selectedNotes.has(note.id)}
            transition:fade={{ duration: 200 }}
          >
            <Note
              {note}
              isEditing={editingNoteId === note.id}
              on:edit={() => handleNoteAction('edit', note)}
              on:delete={() => handleNoteAction('delete', note)}
              on:archive={() => handleNoteAction('archive', note)}
              on:pin={() => handleNoteAction('pin', note)}
              on:restore={() => handleNoteAction('restore', note)}
              on:colorChange={(e) => handleColorChange(note, e.detail)}
              on:action={(e) => handleNoteAction(e.detail, note)}
              isSelected={$notesStore.selectedNotes.has(note.id)}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if unpinnedNotes.length > 0}
    <div class="notes-section">
      {#if pinnedNotes.length > 0}
        <h2 class="section-heading">Others</h2>
      {/if}
      <div class="notes-container" class:list-view={$notesStore.view === 'list'}>
        {#each unpinnedNotes as note (note.id)}
          <div
            class="note-wrapper"
            class:pinned={note.isPinned}
            class:selected={$notesStore.selectedNotes.has(note.id)}
            transition:fade={{ duration: 200 }}
          >
            <Note
              {note}
              isEditing={editingNoteId === note.id}
              on:edit={() => handleNoteAction('edit', note)}
              on:delete={() => handleNoteAction('delete', note)}
              on:archive={() => handleNoteAction('archive', note)}
              on:pin={() => handleNoteAction('pin', note)}
              on:restore={() => handleNoteAction('restore', note)}
              on:colorChange={(e) => handleColorChange(note, e.detail)}
              on:action={(e) => handleNoteAction(e.detail, note)}
              isSelected={$notesStore.selectedNotes.has(note.id)}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
{:else}
  <div class="notes-container" class:list-view={$notesStore.view === 'list'}>
    {#each $filteredNotes as note (note.id)}
      <div
        class="note-wrapper"
        class:pinned={note.isPinned}
        class:selected={$notesStore.selectedNotes.has(note.id)}
        transition:fade={{ duration: 200 }}
      >
        <Note
          {note}
          isEditing={editingNoteId === note.id}
          on:edit={() => handleNoteAction('edit', note)}
          on:delete={() => handleNoteAction('delete', note)}
          on:archive={() => handleNoteAction('archive', note)}
          on:pin={() => handleNoteAction('pin', note)}
          on:restore={() => handleNoteAction('restore', note)}
          on:colorChange={(e) => handleColorChange(note, e.detail)}
          on:action={(e) => handleNoteAction(e.detail, note)}
          isSelected={$notesStore.selectedNotes.has(note.id)}
        />
      </div>
    {/each}
  </div>
{/if}

{#if $filteredNotes.length === 0}
  <div class="empty-state" transition:fade>
    <p class="empty-message">
      {#if $notesStore.searchQuery}
        No notes found matching your search.
      {:else if $notesStore.activeTags.length > 0}
        No notes found with the selected tags.
      {:else if $currentViewType === 'trash'}
        No notes in trash.
      {:else if $currentViewType === 'archived'}
        No archived notes.
      {:else}
        No notes yet. Create your first note!
      {/if}
    </p>
  </div>
{/if}

<ConfirmModal
  show={showConfirmModal}
  title={
    confirmAction === 'delete' 
      ? ($currentViewType === 'trash' ? 'Delete Note' : 'Move to Trash')
      : confirmAction === 'restore'
      ? 'Restore Note'
      : confirmAction === 'archive'
      ? 'Archive Note'
      : 'Confirm Action'
  }
  message={
    confirmAction === 'delete'
      ? ($currentViewType === 'trash' 
        ? 'Are you sure you want to permanently delete this note? This action cannot be undone.'
        : 'Move this note to trash?')
      : confirmAction === 'restore'
      ? 'Restore this note to active notes?'
      : confirmAction === 'archive'
      ? 'Move this note to archive?'
      : 'Are you sure you want to proceed?'
  }
  confirmText={
    confirmAction === 'delete'
      ? ($currentViewType === 'trash' ? 'Delete Permanently' : 'Move to Trash')
      : confirmAction === 'restore'
      ? 'Restore'
      : confirmAction === 'archive'
      ? 'Archive'
      : 'Confirm'
  }
  type={
    confirmAction === 'delete' 
      ? 'danger' 
      : confirmAction === 'restore'
      ? 'info'
      : 'warning'
  }
  on:confirm={handleConfirm}
  on:cancel={handleCancel}
/>

<style>
  .notes-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
  }

  .notes-container.list-view {
    grid-template-columns: 1fr;
    max-width: 800px;
    padding-top: calc(var(--spacing-md) / 2);
    margin-left: auto;
    margin-right: auto;
  }

  .note-wrapper {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .note-wrapper.pinned {
    order: -1;
  }

  .note-wrapper.selected {
    outline: 2px solid var(--color-accent-blue);
    outline-offset: 2px;
    border-radius: var(--radius-md);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-xl);
    background-color: var(--color-bg-secondary);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
  }

  .empty-message {
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 1.1rem;
  }

  @media (max-width: 1024px) {
    .notes-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .notes-container {
      grid-template-columns: 1fr;
      padding: var(--spacing-sm);
    }
  }

  .notes-section {
    margin-bottom: var(--spacing-xl);
  }

  .section-heading {
    font-family: var(--font-mono);
    font-size: 1.2rem;
    color: var(--color-text-muted);
    margin: 0 0 var(--spacing-md) var(--spacing-md);
    opacity: 0.8;
  }

  .notes-container.list-view + .section-heading,
  .notes-section:has(.notes-container.list-view) .section-heading {
    text-transform: lowercase;
    font-size: 0.95rem;
    text-align: start;
    margin: 0 0 0 calc(50% - 400px + var(--spacing-md) + 16px);
  }

  @media (max-width: 800px) {
    .notes-container.list-view + .section-heading,
    .notes-section:has(.notes-container.list-view) .section-heading {
      margin-left: calc(var(--spacing-md) + 10px);
    }
  }

  @media (max-width: 640px) {
    .section-heading {
      font-size: 1.1rem;
      margin-left: var(--spacing-sm);
    }

    .notes-container.list-view + .section-heading,
    .notes-section:has(.notes-container.list-view) .section-heading {
      font-size: 0.9rem;
    }
  }
</style> 