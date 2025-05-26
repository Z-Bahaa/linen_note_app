<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore } from '$lib/stores/notes';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import NotesGrid from '$lib/components/NotesGrid.svelte';
  import type { Note } from '$lib/types';

  let showNewNoteModal = false;
  let newNoteTitle = '';
  let newNoteContent = '';

  function handleNewNote() {
    showNewNoteModal = true;
  }

  function handleNewFolder() {
    // TODO: Implement folder creation
    alert('Folder creation coming soon!');
  }

  function createNote() {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) {
      return; // do nothing if neither title nor content is non‐empty
    }
    notesStore.addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      color: 'default',
      tags: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false
    });
    // Reset form
    newNoteTitle = '';
    newNoteContent = '';
    showNewNoteModal = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      createNote();
    } else if (event.key === 'Escape') {
      showNewNoteModal = false;
    }
  }
</script>

<svelte:head>
  <title>Vintage Notes</title>
</svelte:head>

<main>
  <Toolbar on:newNote={handleNewNote} on:newFolder={handleNewFolder} />
  <NotesGrid />
</main>

{#if showNewNoteModal}
  <div class="modal-backdrop" on:click={() => (showNewNoteModal = false)}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <input
          type="text"
          bind:value={newNoteTitle}
          placeholder="Note title..."
          class="modal-title"
          on:keydown={handleKeyDown}
        />
        <button class="modal-close" on:click={() => (showNewNoteModal = false)}>
          ✕
        </button>
      </div>
      <textarea
        bind:value={newNoteContent}
        placeholder="Start writing..."
        class="modal-content"
        on:keydown={handleKeyDown}
        rows="10"
      />
      <div class="modal-footer">
        <button class="modal-button cancel" on:click={() => (showNewNoteModal = false)}>
          Cancel
        </button>
        <button class="modal-button save" on:click={createNote}>
          Save Note
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .modal {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-title {
    flex: 1;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: 1.2rem;
    padding: var(--spacing-xs) 0;
  }

  .modal-title:focus {
    outline: none;
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 1.2rem;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-tertiary);
  }

  .modal-content {
    flex: 1;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.6;
    padding: var(--spacing-md);
    resize: none;
    min-height: 200px;
  }

  .modal-content:focus {
    outline: none;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }

  .modal-button {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .modal-button.cancel {
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .modal-button.cancel:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .modal-button.save {
    background-color: var(--color-accent-blue);
    border: none;
    color: white;
  }

  .modal-button.save:hover {
    background-color: var(--color-accent-blue);
    opacity: 0.9;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 640px) {
    .modal {
      width: 95%;
      max-height: 95vh;
    }

    .modal-button {
      padding: var(--spacing-xs) var(--spacing-md);
    }
  }
</style>
