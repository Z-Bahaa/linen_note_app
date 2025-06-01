<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note, NoteColor } from '$lib/types';
  import { fade, fly } from 'svelte/transition';
  import { notesStore, currentViewType } from '$lib/stores/notes';

  export let note: Note;
  export let isEditing = false;
  export let isSelected = false;

  const dispatch = createEventDispatcher<{
    edit: void;
    delete: void;
    archive: void;
    pin: void;
    restore: void;
    colorChange: NoteColor;
    action: string;
  }>();

  let isHovered = false;
  let showActions = false;

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
    notesStore.updateNoteColor(note.id, color);
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

  $: displayTitle = note.title ? note.title : '';
  $: deletedAt = note.isDeleted ? note.updatedAt : null;
  $: archivedAt = note.isArchived ? note.updatedAt : null;

  function handleClick(event: MouseEvent) {
    // Only handle click for editing in normal view
    if ($currentViewType === 'active') {
      const target = event.target as HTMLElement;
      if (
        target.closest('.note-actions') ||
        target.closest('.color-picker') ||
        target.closest('.action-button') ||
        target.closest('.selection-indicator')
      ) return;
      dispatch('edit');
    }
  }

  function handleSelectionClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    dispatch('action', 'select');
  }
</script>

{#if note.title || note.content}
<div
  class="note-card"
  class:editing={isEditing}
  class:pinned={note.isPinned}
  class:selected={isSelected}
  style="background-color: var(--note-color-{note.color})"
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => {
    isHovered = false;
    showActions = false;
  }}
  on:click={handleClick}
  transition:fly={{ y: 20, duration: 200 }}
>
  <div class="note-header">
    <div class="note-title-container">
      {#if isEditing}
        <input
          bind:value={note.title}
          placeholder="Enter title..."
          class="note-title-input"
        />
      {:else if note.title}
        <h3 class="note-title" class:empty={!note.title}>
          {note.title}
        </h3>
      {:else}
        <h3 class="note-title empty">No title</h3>
      {/if}
    </div>
    <div class="note-header-actions">
      {#if $currentViewType === 'active'}
        {#if note.isPinned}
          <button
            class="pin-indicator"
            title="Unpin note"
            on:click|stopPropagation={() => dispatch('action', 'togglePin')}
          >
            <span class="pin-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8, 1 L 8, 15 M 4, 5 L 12, 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        {:else}
          <button
            class="pin-indicator"
            title="Pin note"
            on:click|stopPropagation={() => dispatch('action', 'togglePin')}
          >
            <span class="pin-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8, 1 L 8, 15 M 4, 5 L 12, 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        {/if}
      {/if}
    </div>
    <span style="display: none;">{note.id}</span>
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
      {#if $currentViewType === 'trash' && deletedAt}
        <div class="deletion-info">
          <span class="deletion-label">Deleted at</span>
          <span class="deletion-date">{formatDate(deletedAt)}</span>
        </div>
      {:else if $currentViewType === 'archived' && archivedAt}
        <div class="archive-info">
          <span class="archive-label">Archived at</span>
          <span class="archive-date">{formatDate(archivedAt)}</span>
        </div>
      {:else}
        <div class="update-info">
          <span class="update-label">Updated at</span>
          <span class="update-date">{formatDate(note.updatedAt)}</span>
        </div>
      {/if}
      {#if note.tags.length > 0}
        <div class="note-tags">
          {#each note.tags as tag}
            <span class="note-tag">#{tag}</span>
          {/each}
        </div>
      {/if}
    </div>

    {#if $currentViewType === 'trash'}
      <div class="note-actions trash-actions" class:visible={isHovered}>
        <button
          class="action-button restore"
          title="Restore note"
          on:click={() => dispatch('restore')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8ZM8 13C10.7614 13 13 10.7614 13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13Z" fill="currentColor"/>
            <path d="M8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V8.5C7 8.77614 7.22386 9 7.5 9H10.5C10.7761 9 11 8.77614 11 8.5C11 8.22386 10.7761 8 10.5 8H8V4.5Z" fill="currentColor"/>
          </svg>
        </button>
        <button
          class="action-button delete"
          title="Delete permanently"
          on:click={() => dispatch('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 2.5C6.5 2.22386 6.72386 2 7 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3H6.5V2.5Z" fill="currentColor"/>
            <path d="M4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5V13.5C12 13.7761 11.7761 14 11.5 14H4.5C4.22386 14 4 13.7761 4 13.5V4.5ZM5 5V13H11V5H5Z" fill="currentColor"/>
            <path d="M6.5 6.5C6.5 6.22386 6.72386 6 7 6C7.27614 6 7.5 6.22386 7.5 6.5V11.5C7.5 11.7761 7.27614 12 7 12C6.72386 12 6.5 11.7761 6.5 11.5V6.5Z" fill="currentColor"/>
            <path d="M8.5 6.5C8.5 6.22386 8.72386 6 9 6C9.27614 6 9.5 6.22386 9.5 6.5V11.5C9.5 11.7761 9.27614 12 9 12C8.72386 12 8.5 11.7761 8.5 11.5V6.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    {:else if $currentViewType === 'archived'}
      <div class="note-actions archived-actions" class:visible={isHovered}>
        <button
          class="action-button"
          title={note.isArchived ? 'Unarchive' : 'Archive'}
          on:click={() => dispatch('action', 'toggleArchive')}
        >
          {#if note.isArchived}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5Z" fill="currentColor"/>
              <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
              <path d="M8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V11.5C7 11.7761 7.22386 12 7.5 12C7.77614 12 8 11.7761 8 11.5V4.5Z" fill="currentColor"/>
              <path d="M5.5 7.5L8 4.5L10.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5Z" fill="currentColor"/>
              <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
            </svg>
          {/if}
        </button>
        <button
          class="action-button delete"
          title="Move to trash"
          on:click={() => dispatch('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 2.5C6.5 2.22386 6.72386 2 7 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3H6.5V2.5Z" fill="currentColor"/>
            <path d="M4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5V13.5C12 13.7761 11.7761 14 11.5 14H4.5C4.22386 14 4 13.7761 4 13.5V4.5ZM5 5V13H11V5H5Z" fill="currentColor"/>
            <path d="M6.5 6.5C6.5 6.22386 6.72386 6 7 6C7.27614 6 7.5 6.22386 7.5 6.5V11.5C7.5 11.7761 7.27614 12 7 12C6.72386 12 6.5 11.7761 6.5 11.5V6.5Z" fill="currentColor"/>
            <path d="M8.5 6.5C8.5 6.22386 8.72386 6 9 6C9.27614 6 9.5 6.22386 9.5 6.5V11.5C9.5 11.7761 9.27614 12 9 12C8.72386 12 8.5 11.7761 8.5 11.5V6.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    {:else}
      <div class="note-actions normal-actions" class:visible={isHovered}>
        {#if $currentViewType !== 'trash'}
          <div class="color-picker-container">
            <button
              class="action-button"
              title="Change color"
              on:click={() => (showActions = !showActions)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13Z" fill="currentColor"/>
                <path d="M8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5Z" fill="currentColor"/>
              </svg>
            </button>
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
          <button
            class="action-button"
            title={note.isArchived ? 'Unarchive' : 'Archive'}
            on:click={() => dispatch('action', 'toggleArchive')}
          >
            {#if note.isArchived}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5Z" fill="currentColor"/>
                <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
                <path d="M8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V11.5C7 11.7761 7.22386 12 7.5 12C7.77614 12 8 11.7761 8 11.5V4.5Z" fill="currentColor"/>
                <path d="M5.5 7.5L8 4.5L10.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5Z" fill="currentColor"/>
                <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
              </svg>
            {/if}
          </button>
        {/if}
        <button
          class="action-button delete"
          title={$currentViewType === 'trash' ? 'Delete permanently' : 'Move to trash'}
          on:click={() => dispatch('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 2.5C6.5 2.22386 6.72386 2 7 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3H6.5V2.5Z" fill="currentColor"/>
            <path d="M4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5V13.5C12 13.7761 11.7761 14 11.5 14H4.5C4.22386 14 4 13.7761 4 13.5V4.5ZM5 5V13H11V5H5Z" fill="currentColor"/>
            <path d="M6.5 6.5C6.5 6.22386 6.72386 6 7 6C7.27614 6 7.5 6.22386 7.5 6.5V11.5C7.5 11.7761 7.27614 12 7 12C6.72386 12 6.5 11.7761 6.5 11.5V6.5Z" fill="currentColor"/>
            <path d="M8.5 6.5C8.5 6.22386 8.72386 6 9 6C9.27614 6 9.5 6.22386 9.5 6.5V11.5C9.5 11.7761 9.27614 12 9 12C8.72386 12 8.5 11.7761 8.5 11.5V6.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>

  {#if $currentViewType === 'trash' || $currentViewType === 'archived'}
    <div 
      class="selection-indicator" 
      class:selected={isSelected}
      on:click={handleSelectionClick}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {#if isSelected}
          <path d="M13.5 3.5C13.5 2.67157 12.8284 2 12 2H4C3.17157 2 2.5 2.67157 2.5 3.5V12.5C2.5 13.3284 3.17157 14 4 14H12C12.8284 14 13.5 13.3284 13.5 12.5V3.5ZM12 3C12.2761 3 12.5 3.22386 12.5 3.5V12.5C12.5 12.7761 12.2761 13 12 13H4C3.72386 13 3.5 12.7761 3.5 12.5V3.5C3.5 3.22386 3.72386 3 4 3H12Z" fill="currentColor"/>
          <path d="M6.5 7.5C6.5 6.94772 6.94772 6.5 7.5 6.5H8.5C9.05228 6.5 9.5 6.94772 9.5 7.5V8.5C9.5 9.05228 9.05228 9.5 8.5 9.5H7.5C6.94772 9.5 6.5 9.05228 6.5 8.5V7.5Z" fill="currentColor"/>
        {:else}
          <path d="M13.5 3.5C13.5 2.67157 12.8284 2 12 2H4C3.17157 2 2.5 2.67157 2.5 3.5V12.5C2.5 13.3284 3.17157 14 4 14H12C12.8284 14 13.5 13.3284 13.5 12.5V3.5ZM12 3C12.2761 3 12.5 3.22386 12.5 3.5V12.5C12.5 12.7761 12.2761 13 12 13H4C3.72386 13 3.5 12.7761 3.5 12.5V3.5C3.5 3.22386 3.72386 3 4 3H12Z" fill="currentColor"/>
        {/if}
      </svg>
    </div>
  {/if}
</div>
{/if}

<style>
  .note-card {
    position: relative;
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
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
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  .note-title-container {
    min-height: 1.5em;
  }

  .note-title {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0;
  }

  .note-title.empty {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .note-header-actions {
    display: flex;
    align-items: flex-start;
  }

  .pin-indicator {
    font-size: 0.9rem;
    opacity: 0.8;
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pin-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-fast);
  }

  .pin-indicator:hover {
    background-color: var(--color-bg-tertiary);
    opacity: 1;
  }

  .note-card.pinned .pin-icon {
    transform: rotate(45deg);
  }

  .note-card.pinned .pin-indicator {
    color: var(--color-accent-yellow);
    opacity: 1;
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

  .action-button.restore:hover {
    color: var(--color-accent-green);
  }

  .action-button.delete:hover {
    color: var(--color-accent-red);
  }

  .color-picker-container {
    position: relative;
  }

  .color-picker {
    position: absolute;
    bottom: 100%;
    right: 0;
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

  .note-title-input {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    width: 100%;
    padding: 0;
  }
  .note-title-input:focus {
    outline: none;
  }

  .note {
    position: relative;
    cursor: pointer;
  }

  .note.selected {
    outline: 2px solid var(--color-accent-blue);
    outline-offset: 2px;
  }

  .selection-indicator {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    color: var(--color-text-muted);
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    cursor: pointer;
    z-index: 1;
  }

  .selection-indicator:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-tertiary);
  }

  .selection-indicator.selected {
    color: var(--color-accent-blue);
  }

  .deletion-info,
  .archive-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .deletion-info {
    color: var(--color-accent-red);
  }

  .archive-info {
    color: var(--color-accent-blue);
  }

  .deletion-label,
  .archive-label {
    opacity: 0.8;
  }

  .deletion-date,
  .archive-date {
    font-weight: 500;
  }

  .trash-actions,
  .archived-actions,
  .normal-actions {
    opacity: 0;
    visibility: visible;
    transition: opacity var(--transition-fast);
  }

  .trash-actions.visible,
  .archived-actions.visible,
  .normal-actions.visible {
    opacity: 1;
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

  /* Remove the old color classes since we're using inline styles now */
  .note-color-default,
  .note-color-blue,
  .note-color-green,
  .note-color-yellow,
  .note-color-red,
  .note-color-purple {
    /* These classes are no longer needed */
  }
</style> 