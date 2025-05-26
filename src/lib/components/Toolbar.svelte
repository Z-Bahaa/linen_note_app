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
      <span class="icon">📝</span>
      <span class="label">New Note</span>
    </button>

    <button
      class="toolbar-button new-folder"
      on:click={() => dispatch('newFolder')}
      title="New Folder"
    >
      <span class="icon">📁</span>
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
      <span class="search-icon">🔍</span>
    </div>
  </div>

  <div class="toolbar-right">
    <button
      class="toolbar-button"
      class:active={$notesStore.view === 'list'}
      on:click={toggleView}
      title={$notesStore.view === 'grid' ? 'List View' : 'Grid View'}
    >
      <span class="icon">{$notesStore.view === 'grid' ? '📋' : '📊'}</span>
    </button>

    <button
      class="toolbar-button"
      class:active={$notesStore.showArchived}
      on:click={toggleArchived}
      title={$notesStore.showArchived ? 'Hide Archived' : 'Show Archived'}
    >
      <span class="icon">📦</span>
    </button>

    <button
      class="toolbar-button"
      class:active={$notesStore.showDeleted}
      on:click={toggleDeleted}
      title={$notesStore.showDeleted ? 'Hide Trash' : 'Show Trash'}
    >
      <span class="icon">🗑️</span>
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
    font-size: 1.1rem;
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
    padding-left: 2.5rem;
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