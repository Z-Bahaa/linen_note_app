<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note, NoteColor } from '$lib/types';
  import { fade } from 'svelte/transition';

  export let show = false;
  export let note: Note;

  const dispatch = createEventDispatcher<{
    save: Note;
    cancel: void;
    colorChange: NoteColor;
  }>();

  let editedNote: Note;
  let showColorPicker = false;

  $: if (note) {
    editedNote = { ...note };
  }

  $: if (!show) {
    showColorPicker = false;
  }

  const colorClasses: Record<NoteColor, string> = {
    default: 'note-color-default',
    blue: 'note-color-blue',
    green: 'note-color-green',
    yellow: 'note-color-yellow',
    red: 'note-color-red',
    purple: 'note-color-purple',
    gold: 'note-color-gold'
  };

  function handleColorChange(color: NoteColor) {
    editedNote.color = color;
    dispatch('colorChange', color);
    showColorPicker = false;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function handleSave() {
    showColorPicker = false;
    dispatch('save', editedNote);
  }

  function handleCancel() {
    showColorPicker = false;
    dispatch('cancel');
  }
</script>

{#if show}
  <div 
    class="modal-backdrop" 
    on:click={handleCancel}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="modal" 
      on:click|stopPropagation
      transition:fade={{ duration: 200 }}
      class:note-color-default={editedNote.color === 'default'}
      class:note-color-blue={editedNote.color === 'blue'}
      class:note-color-green={editedNote.color === 'green'}
      class:note-color-yellow={editedNote.color === 'yellow'}
      class:note-color-red={editedNote.color === 'red'}
      class:note-color-purple={editedNote.color === 'purple'}
      class:note-color-gold={editedNote.color === 'gold'}
    >
      <div class="modal-header">
        <input
          type="text"
          id="modal-title"
          bind:value={editedNote.title}
          placeholder="Note title..."
          class="modal-title"
        />
        <button 
          type="button"
          class="modal-close" 
          on:click={handleCancel}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="modal-content">
        <textarea
          bind:value={editedNote.content}
          placeholder="Start writing..."
          class="note-editor"
          rows="10"
        />
      </div>

      <div class="color-picker-container">
        <button
          class="action-button"
          title="Change color"
          on:click={() => (showColorPicker = !showColorPicker)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.47 2.22a.75.75 0 0 1 1.06 0c.403.403 1.999 2.127 3.499 4.362C17.509 8.785 19 11.635 19 14.25c0 2.524-.746 4.479-2.044 5.806C15.659 21.38 13.889 22 12 22c-1.89 0-3.659-.619-4.956-1.944C5.746 18.729 5 16.774 5 14.25c0-2.615 1.492-5.465 2.971-7.668 1.5-2.235 3.096-3.96 3.499-4.362ZM9.216 7.418C7.758 9.59 6.5 12.115 6.5 14.25c0 2.226.653 3.771 1.617 4.757.965.987 2.32 1.493 3.883 1.493 1.562 0 2.918-.506 3.883-1.493.964-.986 1.617-2.53 1.617-4.757 0-2.135-1.258-4.66-2.716-6.832A33.359 33.359 0 0 0 12 3.848a33.357 33.357 0 0 0-2.784 3.57Z" fill="currentColor"/>
          </svg>
        </button>
        {#if showColorPicker}
          <div class="color-picker" transition:fade>
            {#each Object.keys(colorClasses) as color}
              <button
                class="color-option {color}"
                class:active={editedNote.color === color}
                on:click={() => handleColorChange(color as NoteColor)}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            {/each}
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          <div class="note-meta">
            <div class="update-info">
              <span class="update-label">Created at</span>
              <span class="update-date">{formatDate(note.createdAt)}</span>
            </div>
            <div class="update-info">
              <span class="update-label">Updated at</span>
              <span class="update-date">{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div class="footer-right">
          <button 
            type="button"
            class="modal-button cancel" 
            on:click={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="button"
            class="modal-button save" 
            class:note-color-default={editedNote.color === 'default'}
            class:note-color-blue={editedNote.color === 'blue'}
            class:note-color-green={editedNote.color === 'green'}
            class:note-color-yellow={editedNote.color === 'yellow'}
            class:note-color-red={editedNote.color === 'red'}
            class:note-color-purple={editedNote.color === 'purple'}
            class:note-color-gold={editedNote.color === 'gold'}
            on:click={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
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
    padding: var(--spacing-md);
    overflow-y: auto;
  }

  .note-editor {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    line-height: 1.5;
    resize: none;
    padding: 0;
  }

  .note-editor:focus {
    outline: none;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-top: 1px solid var(--color-border);
    gap: var(--spacing-md);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .footer-right {
    display: flex;
    gap: var(--spacing-sm);
  }

  .note-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .update-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .update-label {
    color: var(--color-text-muted);
    opacity: 0.8;
  }

  .update-date {
    color: var(--color-text-muted);
  }

  .note-actions {
    display: flex;
    gap: var(--spacing-xs);
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
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .color-picker-container {
    position: relative;
    padding: var(--spacing-md);
    padding-bottom: 0;
    display: flex;
    justify-content: flex-end;
  }

  .color-picker {
    position: absolute;
    bottom: 100%;
    right: var(--spacing-md);
    margin-bottom: var(--spacing-xs);
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-xs);
    display: flex;
    gap: var(--spacing-xs);
    z-index: 10;
  }

  .color-option {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--color-bg-elevated);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .color-option.default { background-color: var(--note-color-default); }
  .color-option.blue { background-color: var(--note-color-blue); }
  .color-option.green { background-color: var(--note-color-green); }
  .color-option.yellow { background-color: var(--note-color-yellow); }
  .color-option.red { background-color: var(--note-color-red); }
  .color-option.purple { background-color: var(--note-color-purple); }
  .color-option.gold { background-color: var(--note-color-gold); }

  .color-option:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8);
  }

  .color-option.active {
    border-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9);
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
    font-weight: 500;
  }

  .modal-button.save.note-color-default { color: var(--note-color-default); }
  .modal-button.save.note-color-blue { color: var(--note-color-blue); }
  .modal-button.save.note-color-green { color: var(--note-color-green); }
  .modal-button.save.note-color-yellow { color: var(--note-color-yellow); }
  .modal-button.save.note-color-red { color: var(--note-color-red); }
  .modal-button.save.note-color-purple { color: var(--note-color-purple); }
  .modal-button.save.note-color-gold { color: var(--note-color-gold); }

  .modal-button.save:hover {
    background-color: var(--color-accent-blue);
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    .modal {
      width: 95%;
      max-height: 95vh;
    }

    .modal-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .footer-left {
      flex-direction: column;
      align-items: flex-start;
    }

    .footer-right {
      justify-content: flex-end;
    }

    .modal-button {
      padding: var(--spacing-xs) var(--spacing-md);
    }
  }
</style> 