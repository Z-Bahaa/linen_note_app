<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note, NoteColor } from '$lib/types';
  import { fade, fly } from 'svelte/transition';
  import { notesStore } from '$lib/stores/notes';

  export let note: Note;
  export let isEditing = false;

  const dispatch = createEventDispatcher<{
    edit: void;
    delete: void;
    archive: void;
    pin: void;
    colorChange: NoteColor;
  }>();

  let isHovered = false;
  let showActions = false;

  const colorClasses: Record<NoteColor, string> = {
    default: 'note-color-default',
    blue: 'note-color-blue',
    green: 'note-color-green',
    yellow: 'note-color-yellow',
    red: 'note-color-red',
    purple: 'note-color-purple'
  };

  function handleColorChange(color: NoteColor) {
    dispatch('colorChange', color);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
</script>

<div
  class="note-card {colorClasses[note.color]}"
  class:editing={isEditing}
  class:pinned={note.isPinned}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => {
    isHovered = false;
    showActions = false;
  }}
  on:click={(e) => {
    
    const target = e.target as HTMLElement;
    if (
      target.closest('.note-actions') ||
      target.closest('.color-picker') ||
      target.closest('.action-button')
    ) return;
    dispatch('edit');
  }}
  transition:fly={{ y: 20, duration: 200 }}
>
  <div class="note-header">
    <h3 class="note-title" class:empty={!note.title}>
      {note.title || 'Untitled Note'}
    </h3>
    {#if note.isPinned}
      <span class="pin-indicator" title="Pinned">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 8, 1 L 8, 15 M 4, 5 L 12, 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    {/if}
  </div>

  <div class="note-content">
    {#if isEditing}
      <textarea
        bind:value={note.content}
        placeholder="Start writing..."
        class="note-editor"
        rows="6"
      />
    {:else}
      <p class="note-text">{note.content || 'No content'}</p>
    {/if}
  </div>

  <div class="note-footer">
    <div class="note-meta">
      <span class="note-date" title="Last updated">
        {formatDate(note.updatedAt)}
      </span>
      {#if note.tags.length > 0}
        <div class="note-tags">
          {#each note.tags as tag}
            <span class="note-tag">#{tag}</span>
          {/each}
        </div>
      {/if}
    </div>

    {#if isHovered}
      <div class="note-actions" transition:fade>
        <button
          class="action-button"
          title="Change color"
          on:click={() => (showActions = !showActions)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none" />
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
        </button>
        <button
          class="action-button"
          title={note.isPinned ? 'Unpin' : 'Pin'}
          on:click={() => dispatch('pin')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 8, 1 L 8, 15 M 4, 5 L 12, 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          class="action-button"
          title={note.isArchived ? 'Unarchive' : 'Archive'}
          on:click={() => dispatch('archive')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
            <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <button
          class="action-button delete"
          title="Delete"
          on:click={() => dispatch('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
            <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    {/if}
  </div>

  {#if showActions}
    <div class="color-picker" transition:fade>
      {#each Object.keys(colorClasses) as color}
        <button
          class="color-option {color}"
          class:active={note.color === color}
          on:click={() => handleColorChange(color as NoteColor)}
          title={color.charAt(0).toUpperCase() + color.slice(1)}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .note-card {
    position: relative;
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background-color: var(--color-bg-elevated);
    transition: all var(--transition-normal);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .note-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .note-card.pinned {
    border-color: var(--color-accent-yellow);
  }

  .note-card.editing {
    border-color: var(--color-accent-blue);
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .note-title {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
  }

  .note-title.empty {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .pin-indicator {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .note-content {
    flex: 1;
    min-height: 100px;
  }

  .note-text {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .note-editor {
    width: 100%;
    height: 100%;
    min-height: 100px;
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

  .note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-border-light);
  }

  .note-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .note-date {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .note-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .note-tag {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-accent-blue);
    background-color: var(--color-bg-tertiary);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
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

  .action-button.delete:hover {
    color: var(--color-accent-red);
  }

  .color-picker {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-xs);
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
    border: 2px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.active {
    border-color: var(--color-text-primary);
  }

  .note-color-default { background-color: var(--note-color-default); }
  .note-color-blue { background-color: var(--note-color-blue); }
  .note-color-green { background-color: var(--note-color-green); }
  .note-color-yellow { background-color: var(--note-color-yellow); }
  .note-color-red { background-color: var(--note-color-red); }
  .note-color-purple { background-color: var(--note-color-purple); }
</style> 