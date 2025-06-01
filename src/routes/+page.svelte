<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore, currentViewType } from '$lib/stores/notes';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import NotesGrid from '$lib/components/NotesGrid.svelte';
  import type { Note } from '$lib/types';

  let showNewNoteModal = false;
  let isSubmitting = false;
  let formError = '';
  
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
  
  <div class="view-header">
    <h1>
      {#if $currentViewType === 'archived'}
        Archived Notes
      {:else if $currentViewType === 'trash'}
        Trash
      {:else}
        All Notes
      {/if}
    </h1>
  </div>
  
  <NotesGrid />
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

      <div class="input-group">
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

  .input-group {
    position: relative;
    width: 100%;
  }

  .error-message {
    position: absolute;
    bottom: -1.5rem;
    left: 0;
    color: var(--color-accent-red);
    font-size: 0.8rem;
    font-family: var(--font-mono);
  }

  .form-error {
    margin: var(--spacing-sm) var(--spacing-md);
    padding: var(--spacing-sm);
    background-color: var(--color-accent-red);
    color: white;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.9rem;
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
</style>
