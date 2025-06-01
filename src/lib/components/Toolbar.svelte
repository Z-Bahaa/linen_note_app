<script lang="ts">
  import { notesStore } from '$lib/stores/notes';
  import { fade, slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    newNote: void;
  }>();

  let showSearch = false;
  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      notesStore.setSearchQuery(input.value);
    }, 300);
  }

  function toggleView() {
    notesStore.setView($notesStore.view === 'grid' ? 'list' : 'grid');
  }

  function toggleArchived() {
    notesStore.toggleArchived();
  }

  function toggleDeleted() {
    notesStore.toggleDeleted();
  }
</script>

<header class="toolbar">
  <div class="toolbar-left">
    <button
      class="toolbar-button new-note"
      on:click={() => dispatch('newNote')}
      title="New Note"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 2C3.67157 2 3 2.67157 3 3.5V12.5C3 13.3284 3.67157 14 4.5 14H11.5C12.3284 14 13 13.3284 13 12.5V5.5C13 5.22386 12.7761 5 12.5 5H8.5C8.22386 5 8 4.77614 8 4.5V2.5C8 2.22386 7.77614 2 7.5 2H4.5ZM4 3.5C4 3.22386 4.22386 3 4.5 3H7V4.5C7 5.32843 7.67157 6 8.5 6H12V12.5C12 12.7761 11.7761 13 11.5 13H4.5C4.22386 13 4 12.7761 4 12.5V3.5Z" fill="currentColor"/>
        <path d="M8.5 2.5C8.5 2.22386 8.72386 2 9 2H12.5C12.7761 2 13 2.22386 13 2.5V5C13 5.27614 12.7761 5.5 12.5 5.5C12.2239 5.5 12 5.27614 12 5V3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 8.77614 2 8.5 2Z" fill="currentColor"/>
      </svg>
      <span class="label">New Note</span>
    </button>
  </div>

  <div class="toolbar-center">
    <div class="search-container" class:search-active={showSearch}>
      <input
        type="text"
        placeholder="Search notes..."
        class="search-input"
        on:input={handleSearch}
        on:focus={() => (showSearch = true)}
        on:blur={() => (showSearch = false)}
      />
      <span class="search-icon">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2.5C4.51472 2.5 2.5 4.51472 2.5 7C2.5 9.48528 4.51472 11.5 7 11.5C8.03957 11.5 8.98959 11.1061 9.70951 10.4638L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L10.4638 9.70951C11.1061 8.98959 11.5 8.03957 11.5 7C11.5 4.51472 9.48528 2.5 7 2.5ZM3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7Z" fill="currentColor"/>
        </svg>
      </span>
    </div>
  </div>

  <div class="toolbar-right">
    <button
      class="toolbar-button"
      class:active={$notesStore.view === 'list'}
      on:click={toggleView}
      title={$notesStore.view === 'grid' ? 'List View' : 'Grid View'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {#if $notesStore.view === 'grid'}
          <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H5.5C6.32843 2 7 2.67157 7 3.5V5.5C7 6.32843 6.32843 7 5.5 7H3.5C2.67157 7 2 6.32843 2 5.5V3.5Z" fill="currentColor"/>
          <path d="M2 10.5C2 9.67157 2.67157 9 3.5 9H5.5C6.32843 9 7 9.67157 7 10.5V12.5C7 13.3284 6.32843 14 5.5 14H3.5C2.67157 14 2 13.3284 2 12.5V10.5Z" fill="currentColor"/>
          <path d="M9 3.5C9 2.67157 9.67157 2 10.5 2H12.5C13.3284 2 14 2.67157 14 3.5V5.5C14 6.32843 13.3284 7 12.5 7H10.5C9.67157 7 9 6.32843 9 5.5V3.5Z" fill="currentColor"/>
          <path d="M9 10.5C9 9.67157 9.67157 9 10.5 9H12.5C13.3284 9 14 9.67157 14 10.5V12.5C14 13.3284 13.3284 14 12.5 14H10.5C9.67157 14 9 13.3284 9 12.5V10.5Z" fill="currentColor"/>
        {:else}
          <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5C14 4.32843 13.3284 5 12.5 5H3.5C2.67157 5 2 4.32843 2 3.5Z" fill="currentColor"/>
          <path d="M2 8C2 7.17157 2.67157 6.5 3.5 6.5H12.5C13.3284 6.5 14 7.17157 14 8C14 8.82843 13.3284 9.5 12.5 9.5H3.5C2.67157 9.5 2 8.82843 2 8Z" fill="currentColor"/>
          <path d="M2 12.5C2 11.6716 2.67157 11 3.5 11H12.5C13.3284 11 14 11.6716 14 12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5Z" fill="currentColor"/>
        {/if}
      </svg>
    </button>

    <button
      class="toolbar-button"
      class:active={$notesStore.showArchived}
      on:click={toggleArchived}
      title={$notesStore.showArchived ? 'Hide Archived' : 'Show Archived'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5Z" fill="currentColor"/>
        <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
      </svg>
    </button>

    <button
      class="toolbar-button"
      class:active={$notesStore.showDeleted}
      on:click={toggleDeleted}
      title={$notesStore.showDeleted ? 'Hide Deleted' : 'Show Deleted'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 2.5C6.5 2.22386 6.72386 2 7 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3H6.5V2.5Z" fill="currentColor"/>
        <path d="M4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5V13.5C12 13.7761 11.7761 14 11.5 14H4.5C4.22386 14 4 13.7761 4 13.5V4.5ZM5 5V13H11V5H5Z" fill="currentColor"/>
        <path d="M6.5 6.5C6.5 6.22386 6.72386 6 7 6C7.27614 6 7.5 6.22386 7.5 6.5V11.5C7.5 11.7761 7.27614 12 7 12C6.72386 12 6.5 11.7761 6.5 11.5V6.5Z" fill="currentColor"/>
        <path d="M8.5 6.5C8.5 6.22386 8.72386 6 9 6C9.27614 6 9.5 6.22386 9.5 6.5V11.5C9.5 11.7761 9.27614 12 9 12C8.72386 12 8.5 11.7761 8.5 11.5V6.5Z" fill="currentColor"/>
      </svg>
    </button>
  </div>
</header>

<style>
  .toolbar {
    background-color: var(--color-bg-secondary);
    padding: var(--spacing-md) 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: var(--spacing-sm);
  }

  .toolbar-center {
    flex: 1;
    max-width: 600px;
    margin: 0 var(--spacing-md);
  }

  .toolbar-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .toolbar-button:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-border-light);
  }

  .toolbar-button.active {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-accent-blue);
  }

  .toolbar-button .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-button .label {
    display: none;
  }

  .new-note,
  .new-folder {
    background-color: var(--color-bg-tertiary);
  }

  .new-note:hover,
  .new-folder:hover {
    background-color: var(--color-bg-elevated);
  }

  .search-container {
    position: relative;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    padding-left: 2.75rem;
    background-color: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    transition: all var(--transition-fast);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-blue);
    background-color: var(--color-bg-elevated);
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  @media (min-width: 768px) {
    .toolbar-button .label {
      display: inline;
    }
  }

  @media (max-width: 640px) {
    .toolbar {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .toolbar-center {
      margin: 0 var(--spacing-sm);
    }

    .toolbar-button {
      padding: var(--spacing-xs) var(--spacing-sm);
    }
  }

  .search-container.search-active .search-input {
    border-color: var(--color-accent-blue);
    background-color: var(--color-bg-elevated);
  }
</style> 