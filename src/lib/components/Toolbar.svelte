<script lang="ts">
  import { notesStore } from '$lib/stores/notes';
  import { fade, slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    newNote: void;
    newFolder: void;
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
    notesStore.update((state) => ({
      showArchived: !state.showArchived
    }));
  }

  function toggleDeleted() {
    notesStore.update((state) => ({
      showDeleted: !state.showDeleted
    }));
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

    <button
      class="toolbar-button new-folder"
      on:click={() => dispatch('newFolder')}
      title="New Folder"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4.5C2 3.67157 2.67157 3 3.5 3H6.5C6.77614 3 7 3.22386 7 3.5V4H12.5C13.3284 4 14 4.67157 14 5.5V11.5C14 12.3284 13.3284 13 12.5 13H3.5C2.67157 13 2 12.3284 2 11.5V4.5ZM3.5 4C3.22386 4 3 4.22386 3 4.5V11.5C3 11.7761 3.22386 12 3.5 12H12.5C12.7761 12 13 11.7761 13 11.5V5.5C13 5.22386 12.7761 5 12.5 5H6.5C6.22386 5 6 4.77614 6 4.5V4H3.5Z" fill="currentColor"/>
      </svg>
      <span class="label">New Folder</span>
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
      {#if $notesStore.view === 'grid'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H6.5C7.32843 2 8 2.67157 8 3.5V6.5C8 7.32843 7.32843 8 6.5 8H3.5C2.67157 8 2 7.32843 2 6.5V3.5ZM3.5 3C3.22386 3 3 3.22386 3 3.5V6.5C3 6.77614 3.22386 7 3.5 7H6.5C6.77614 7 7 6.77614 7 6.5V3.5C7 3.22386 6.77614 3 6.5 3H3.5Z" fill="currentColor"/>
          <path d="M9 3.5C9 2.67157 9.67157 2 10.5 2H13.5C14.3284 2 15 2.67157 15 3.5V6.5C15 7.32843 14.3284 8 13.5 8H10.5C9.67157 8 9 7.32843 9 6.5V3.5ZM10.5 3C10.2239 3 10 3.22386 10 3.5V6.5C10 6.77614 10.2239 7 10.5 7H13.5C13.7761 7 14 6.77614 14 6.5V3.5C14 3.22386 13.7761 3 13.5 3H10.5Z" fill="currentColor"/>
          <path d="M2 9.5C2 8.67157 2.67157 8 3.5 8H6.5C7.32843 8 8 8.67157 8 9.5V12.5C8 13.3284 7.32843 14 6.5 14H3.5C2.67157 14 2 13.3284 2 12.5V9.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5V12.5C3 12.7761 3.22386 13 3.5 13H6.5C6.77614 13 7 12.7761 7 12.5V9.5C7 9.22386 6.77614 9 6.5 9H3.5Z" fill="currentColor"/>
          <path d="M9 9.5C9 8.67157 9.67157 8 10.5 8H13.5C14.3284 8 15 8.67157 15 9.5V12.5C15 13.3284 14.3284 14 13.5 14H10.5C9.67157 14 9 13.3284 9 12.5V9.5ZM10.5 9C10.2239 9 10 9.22386 10 9.5V12.5C10 12.7761 10.2239 13 10.5 13H13.5C13.7761 13 14 12.7761 14 12.5V9.5C14 9.22386 13.7761 9 13.5 9H10.5Z" fill="currentColor"/>
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5V3.5ZM3.5 3C3.22386 3 3 3.22386 3 3.5V4.5C3 4.77614 3.22386 5 3.5 5H12.5C12.7761 5 13 4.77614 13 4.5V3.5C13 3.22386 12.7761 3 12.5 3H3.5Z" fill="currentColor"/>
          <path d="M2 6.5C2 5.67157 2.67157 5 3.5 5H12.5C13.3284 5 14 5.67157 14 6.5V7.5C14 7.77614 13.7761 8 13.5 8H2.5C2.22386 8 2 7.77614 2 7.5V6.5ZM3.5 6C3.22386 6 3 6.22386 3 6.5V7.5C3 7.77614 3.22386 8 3.5 8H12.5C12.7761 8 13 7.77614 13 7.5V6.5C13 6.22386 12.7761 6 12.5 6H3.5Z" fill="currentColor"/>
          <path d="M2 9.5C2 8.67157 2.67157 8 3.5 8H12.5C13.3284 8 14 8.67157 14 9.5V10.5C14 10.7761 13.7761 11 13.5 11H2.5C2.22386 11 2 10.7761 2 10.5V9.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5V10.5C3 10.7761 3.22386 11 3.5 11H12.5C12.7761 11 13 10.7761 13 10.5V9.5C13 9.22386 12.7761 9 12.5 9H3.5Z" fill="currentColor"/>
          <path d="M2 12.5C2 11.6716 2.67157 11 3.5 11H12.5C13.3284 11 14 11.6716 14 12.5V13.5C14 13.7761 13.7761 14 13.5 14H2.5C2.22386 14 2 13.7761 2 13.5V12.5ZM3.5 12C3.22386 12 3 12.2239 3 12.5V13.5C3 13.7761 3.22386 14 3.5 14H12.5C12.7761 14 13 13.7761 13 13.5V12.5C13 12.2239 12.7761 12 12.5 12H3.5Z" fill="currentColor"/>
        </svg>
      {/if}
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
      title={$notesStore.showDeleted ? 'Hide Trash' : 'Show Trash'}
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    gap: var(--spacing-md);
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
      padding: var(--spacing-sm);
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