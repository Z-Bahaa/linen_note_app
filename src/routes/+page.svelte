<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { notesStore, currentViewType } from '$lib/stores/notes';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import NotesGrid from '$lib/components/NotesGrid.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import TagManager from '$lib/components/TagManager.svelte';
  import type { Note } from '$lib/types';

  let showNewNoteModal = false;
  let isSubmitting = false;
  let formError = '';
  let showConfirmModal = false;
  let confirmAction: 'deleteSelected' | 'restoreSelected' | 'unarchiveSelected' | 'moveToTrash' | null = null;
  
  // Form data
  let formData = {
    title: '',
    content: '',
    color: 'default' as Note['color'],
    tags: [] as string[]
  };

  // Form validation
  let formErrors = {
    title: '',
    content: ''
  };

  let showColorPicker = false;

  const colorClasses: Record<Note['color'], string> = {
    default: 'note-color-default',
    blue: 'note-color-blue',
    green: 'note-color-green',
    yellow: 'note-color-yellow',
    red: 'note-color-red',
    purple: 'note-color-purple',
    gold: 'note-color-gold'
  };

  function validateForm() {
    let isValid = true;
    formErrors = {
      title: '',
      content: ''
    };

    if (formData.title.length > 100) {
      formErrors.title = 'Title must be less than 100 characters';
      isValid = false;
    }

    if (formData.content.length > 10000) {
      formErrors.content = 'Content must be less than 10,000 characters';
      isValid = false;
    }

    // Require either title/content or tags
    if (!formData.title.trim() && !formData.content.trim() && formData.tags.length === 0) {
      formError = 'Please add a title, content, or at least one tag';
      isValid = false;
    }

    return isValid;
  }

  function handleNewNote() {
    // Reset form state
    formData = {
      title: '',
      content: '',
      color: 'default',
      tags: []
    };
    formError = '';
    formErrors = { title: '', content: '' };
    showColorPicker = false;
    showNewNoteModal = true;
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      formError = 'Please fix the errors before saving';
      return;
  }

    try {
      isSubmitting = true;
      formError = '';

    // Only create a note if there's content
      if (formData.title.trim() || formData.content.trim()) {
      notesStore.addNote({
          title: formData.title.trim(),
          content: formData.content.trim(),
          color: formData.color,
          tags: formData.tags,
        isPinned: false,
        isArchived: false,
        isDeleted: false
      });
    }
    
      // Reset and close
    showNewNoteModal = false;
    } catch (error) {
      formError = 'Failed to create note. Please try again.';
      console.error('Error creating note:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      showNewNoteModal = false;
    }
  }

  function handleDeleteSelected() {
    confirmAction = 'deleteSelected';
    showConfirmModal = true;
  }

  function handleRestoreSelected() {
    confirmAction = 'restoreSelected';
    showConfirmModal = true;
  }

  function handleUnarchiveSelected() {
    confirmAction = 'unarchiveSelected';
    showConfirmModal = true;
  }

  function handleMoveToTrash() {
    confirmAction = 'moveToTrash';
    showConfirmModal = true;
  }

  function handleConfirm() {
    if (!confirmAction) return;
    
    const selectedCount = $notesStore.selectedNotes.size;
    
    switch (confirmAction) {
      case 'deleteSelected':
        if (selectedCount === 0) {
          notesStore.permanentlyDeleteAllTrash();
        } else {
          notesStore.permanentlyDeleteSelected();
        }
        break;
      case 'restoreSelected':
        if (selectedCount === 0) {
          notesStore.restoreAllFromTrash();
        } else {
          notesStore.restoreSelected();
        }
        break;
      case 'unarchiveSelected':
        if (selectedCount === 0) {
          notesStore.unarchiveAll();
        } else {
          notesStore.unarchiveSelected();
        }
        break;
      case 'moveToTrash':
        if (selectedCount === 0) {
          notesStore.moveAllToTrash();
        } else {
          notesStore.moveSelectedToTrash();
        }
        break;
    }
    
    confirmAction = null;
    showConfirmModal = false;
  }

  function handleCancel() {
    confirmAction = null;
    showConfirmModal = false;
  }

  function handleSelectAll() {
    notesStore.selectAllNotes();
  }

  function handleClearSelection() {
    notesStore.clearSelection();
  }

  function handleColorChange(color: Note['color']) {
    formData.color = color;
    showColorPicker = false;
  }

  function handleAddTag(event: CustomEvent<string>) {
    const tag = event.detail;
    if (!formData.tags.includes(tag)) {
      formData.tags = [...formData.tags, tag];
    }
  }

  function handleRemoveTag(event: CustomEvent<string>) {
    const tag = event.detail;
    formData.tags = formData.tags.filter(t => t !== tag);
  }

  function handleCreateTag(event: CustomEvent<string>) {
    const tag = event.detail;
    notesStore.addTag(tag);
    if (!formData.tags.includes(tag)) {
      formData.tags = [...formData.tags, tag];
    }
  }

  // Focus title input when modal opens
  $: if (showNewNoteModal) {
    setTimeout(() => {
      const titleInput = document.getElementById('note-title');
      if (titleInput) titleInput.focus();
    }, 100);
  }
</script>

<svelte:head>
  <title>Vintage Notes</title>
</svelte:head>

<main>
  <Toolbar on:newNote={handleNewNote} />
  
  <div class="content-wrapper">
    <div class="view-header">
      <div class="header-content">
        <div class="header-left">
          <h1>
            {#if $currentViewType === 'archived'}
              Archived Notes
            {:else if $currentViewType === 'trash'}
              Trash
            {:else}
              All Notes
            {/if}
          </h1>
          {#if $currentViewType === 'trash' || $currentViewType === 'archived'}
            <div class="selection-actions">
              {#if $notesStore.selectedNotes.size > 0}
                <button 
                  class="selection-button"
                  on:click={handleClearSelection}
                  title="Clear selection"
                >
                  Clear Selection
                </button>
              {:else}
                <button 
                  class="selection-button"
                  on:click={handleSelectAll}
                  title="Select all notes"
                >
                  Select All
                </button>
              {/if}
            </div>
          {/if}
        </div>
        {#if $currentViewType === 'trash'}
          <div class="header-actions">
            <button 
              class="restore-all-button"
              on:click={handleRestoreSelected}
              title={$notesStore.selectedNotes.size === 0 ? "Restore all notes from trash" : `Restore ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            >
              {$notesStore.selectedNotes.size === 0 ? 'Restore All' : `Restore ${$notesStore.selectedNotes.size} Note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            </button>
            <button 
              class="delete-all-button"
              on:click={handleDeleteSelected}
              title={$notesStore.selectedNotes.size === 0 ? "Permanently delete all notes in trash" : `Permanently delete ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            >
              {$notesStore.selectedNotes.size === 0 ? 'Delete All' : `Delete ${$notesStore.selectedNotes.size} Note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            </button>
          </div>
        {:else if $currentViewType === 'archived'}
          <div class="header-actions">
            <button 
              class="restore-all-button"
              on:click={handleUnarchiveSelected}
              title={$notesStore.selectedNotes.size === 0 ? "Unarchive all notes" : `Unarchive ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            >
              {$notesStore.selectedNotes.size === 0 ? 'Unarchive All' : `Unarchive ${$notesStore.selectedNotes.size} Note${$notesStore.selectedNotes.size === 1 ? '' : 's'}`}
            </button>
            <button 
              class="delete-all-button"
              on:click={handleMoveToTrash}
              title={$notesStore.selectedNotes.size === 0 ? "Move all archived notes to trash" : `Move ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'} to trash`}
            >
              {$notesStore.selectedNotes.size === 0 ? 'Move All to Trash' : `Move ${$notesStore.selectedNotes.size} to Trash`}
            </button>
          </div>
        {/if}
      </div>
    </div>
    
  <NotesGrid />
  </div>
</main>

{#if showNewNoteModal}
  <div 
    class="modal-backdrop" 
    on:click={() => (showNewNoteModal = false)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <form 
      class="modal" 
      on:click|stopPropagation
      on:submit|preventDefault={handleSubmit}
      class:note-color-default={formData.color === 'default'}
      class:note-color-blue={formData.color === 'blue'}
      class:note-color-green={formData.color === 'green'}
      class:note-color-yellow={formData.color === 'yellow'}
      class:note-color-red={formData.color === 'red'}
      class:note-color-purple={formData.color === 'purple'}
      class:note-color-gold={formData.color === 'gold'}
    >
      <div class="modal-header">
        <h2 id="modal-title" class="visually-hidden">Create New Note</h2>
        <div class="input-group">
          <input
            type="text"
            id="note-title"
            name="title"
            bind:value={formData.title}
            placeholder="Note title..."
            class="modal-title"
            class:error={formErrors.title}
            on:keydown={handleKeyDown}
            aria-invalid={!!formErrors.title}
            aria-describedby={formErrors.title ? 'title-error' : undefined}
            maxlength="100"
          />
          {#if formErrors.title}
            <div id="title-error" class="error-message">{formErrors.title}</div>
          {/if}
        </div>
        <button 
          type="button"
          class="modal-close" 
          on:click={() => (showNewNoteModal = false)}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="modal-content">
        <textarea
          id="note-content"
          name="content"
          bind:value={formData.content}
          placeholder="Start writing..."
          class="modal-content"
          class:error={formErrors.content}
          on:keydown={handleKeyDown}
          aria-invalid={!!formErrors.content}
          aria-describedby={formErrors.content ? 'content-error' : undefined}
          maxlength="10000"
          rows="10"
        />
        {#if formErrors.content}
          <div id="content-error" class="error-message">{formErrors.content}</div>
        {/if}
      </div>

      <div class="modal-actions">
        <TagManager
          selectedTags={formData.tags}
          on:addTag={handleAddTag}
          on:removeTag={handleRemoveTag}
          on:createTag={handleCreateTag}
        />

        <div class="color-picker-container">
          <button
            type="button"
            class="action-button"
            title="Change color"
            on:click|stopPropagation={() => (showColorPicker = !showColorPicker)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.47 2.22a.75.75 0 0 1 1.06 0c.403.403 1.999 2.127 3.499 4.362C17.509 8.785 19 11.635 19 14.25c0 2.524-.746 4.479-2.044 5.806C15.659 21.38 13.889 22 12 22c-1.89 0-3.659-.619-4.956-1.944C5.746 18.729 5 16.774 5 14.25c0-2.615 1.492-5.465 2.971-7.668 1.5-2.235 3.096-3.96 3.499-4.362ZM9.216 7.418C7.758 9.59 6.5 12.115 6.5 14.25c0 2.226.653 3.771 1.617 4.757.965.987 2.32 1.493 3.883 1.493 1.562 0 2.918-.506 3.883-1.493.964-.986 1.617-2.53 1.617-4.757 0-2.135-1.258-4.66-2.716-6.832A33.359 33.359 0 0 0 12 3.848a33.357 33.357 0 0 0-2.784 3.57Z" fill="currentColor"/>
            </svg>
          </button>
          {#if showColorPicker}
            <div class="color-picker" transition:fade>
              {#each Object.keys(colorClasses) as color}
                <button
                  type="button"
                  class="color-option {color}"
                  class:active={formData.color === color}
                  on:click|stopPropagation={() => handleColorChange(color as Note['color'])}
                  title={color.charAt(0).toUpperCase() + color.slice(1)}
                />
              {/each}
            </div>
          {/if}
        </div>
      </div>

      {#if formError}
        <div class="form-error" role="alert">
          {formError}
        </div>
      {/if}

      <div class="modal-footer">
        <button 
          type="button"
          class="modal-button cancel" 
          on:click={() => (showNewNoteModal = false)}
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="modal-button save" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  </div>
{/if}

<ConfirmModal
  show={showConfirmModal}
  title={
    confirmAction === 'deleteSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Delete All' : 'Delete Selected')
      : confirmAction === 'restoreSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Restore All' : 'Restore Selected')
      : confirmAction === 'unarchiveSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Unarchive All' : 'Unarchive Selected')
      : confirmAction === 'moveToTrash'
      ? ($notesStore.selectedNotes.size === 0 ? 'Move All to Trash' : 'Move Selected to Trash')
      : 'Confirm Action'
  }
  message={
    confirmAction === 'deleteSelected'
      ? ($notesStore.selectedNotes.size === 0
        ? 'Are you sure you want to permanently delete all notes in trash? This action cannot be undone.'
        : `Are you sure you want to permanently delete ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}? This action cannot be undone.`)
      : confirmAction === 'restoreSelected'
      ? ($notesStore.selectedNotes.size === 0
        ? 'Are you sure you want to restore all notes from trash?'
        : `Are you sure you want to restore ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}?`)
      : confirmAction === 'unarchiveSelected'
      ? ($notesStore.selectedNotes.size === 0
        ? 'Are you sure you want to unarchive all notes?'
        : `Are you sure you want to unarchive ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'}?`)
      : confirmAction === 'moveToTrash'
      ? ($notesStore.selectedNotes.size === 0
        ? 'Are you sure you want to move all archived notes to trash?'
        : `Are you sure you want to move ${$notesStore.selectedNotes.size} selected note${$notesStore.selectedNotes.size === 1 ? '' : 's'} to trash?`)
      : 'Are you sure you want to proceed?'
  }
  confirmText={
    confirmAction === 'deleteSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Delete All' : 'Delete Selected')
      : confirmAction === 'restoreSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Restore All' : 'Restore Selected')
      : confirmAction === 'unarchiveSelected'
      ? ($notesStore.selectedNotes.size === 0 ? 'Unarchive All' : 'Unarchive Selected')
      : confirmAction === 'moveToTrash'
      ? ($notesStore.selectedNotes.size === 0 ? 'Move All to Trash' : 'Move Selected to Trash')
      : 'Confirm'
  }
  type={
    confirmAction === 'deleteSelected'
      ? 'danger'
      : confirmAction === 'restoreSelected'
      ? 'info'
      : 'warning'
  }
  on:confirm={handleConfirm}
  on:cancel={handleCancel}
/>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content-wrapper {
    padding: 0 40px;
  }

  @media (max-width: 640px) {
    .content-wrapper {
      padding: 0 var(--spacing-md);
    }

    .modal {
      width: 95%;
      max-height: 95vh;
    }

    .modal-button {
      padding: var(--spacing-xs) var(--spacing-md);
    }
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
    background-color: var(--note-color-default);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal.note-color-default { background-color: var(--note-color-default); }
  .modal.note-color-blue { background-color: var(--note-color-blue); }
  .modal.note-color-green { background-color: var(--note-color-green); }
  .modal.note-color-yellow { background-color: var(--note-color-yellow); }
  .modal.note-color-red { background-color: var(--note-color-red); }
  .modal.note-color-purple { background-color: var(--note-color-purple); }
  .modal.note-color-gold { background-color: var(--note-color-gold); }

  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .input-group {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .modal-title {
    flex: 1;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: 1.2rem;
    padding: var(--spacing-xs) 0;
    width: 100%;
  }

  .modal-title:focus {
    outline: none;
  }

  .modal-content {
    flex: 1;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.6;
    padding: var(--spacing-sm);
    resize: none;
    min-height: 200px;
    width: 100%;
  }

  .modal-content:focus {
    outline: none;
  }

  .error-message {
    color: var(--color-accent-red);
    font-size: 0.8rem;
    font-family: var(--font-mono);
    margin-top: var(--spacing-xs);
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

  .modal-title.error,
  .modal-content.error {
    border-color: var(--color-accent-red);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .modal-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .view-header {
    padding: var(--spacing-md);
  }

  .view-header h1 {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    color: var(--color-text-primary);
    margin: 0;
    opacity: 0.8;
  }

  @media (max-width: 640px) {
    .view-header {
      padding: var(--spacing-sm);
    }

    .view-header h1 {
      font-size: 1.2rem;
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .delete-all-button,
  .restore-all-button {
    padding: var(--spacing-xs) var(--spacing-md);
    background: none;
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .delete-all-button {
    border: 1px solid var(--color-accent-red);
    color: var(--color-accent-red);
  }

  .delete-all-button:hover {
    background-color: var(--color-accent-red);
    color: white;
  }

  .restore-all-button {
    border: 1px solid var(--color-accent-blue);
    color: var(--color-accent-blue);
  }

  .restore-all-button:hover {
    background-color: var(--color-accent-blue);
    color: white;
  }

  @media (max-width: 640px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .delete-all-button,
    .restore-all-button {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 0.8rem;
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    }

  .selection-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .selection-button {
      padding: var(--spacing-xs) var(--spacing-md);
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .selection-button:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-border-light);
  }

  @media (max-width: 640px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .header-left {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .selection-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }

  .color-picker-container {
    position: relative;
    display: flex;
    justify-content: flex-end;
    padding-right: var(--spacing-xs);
  }

  .action-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 1rem;
    padding: 4px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .action-button:hover {
    color: var(--color-text-primary);
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
  }
</style>
