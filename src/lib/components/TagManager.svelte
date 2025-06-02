<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { notesStore } from '$lib/stores/notes';

  export let selectedTags: string[] = [];
  export let showTagPicker = false;

  const dispatch = createEventDispatcher<{
    addTag: string;
    removeTag: string;
    createTag: string;
  }>();

  let searchQuery = '';
  let showSearchResults = false;

  $: filteredTags = searchQuery
    ? $notesStore.tags.filter(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTags.includes(tag)
      )
    : $notesStore.tags.filter(tag => !selectedTags.includes(tag));

  function handleAddTag(tag: string) {
    dispatch('addTag', tag);
    searchQuery = '';
    showSearchResults = false;
    showTagPicker = false;
  }

  function handleRemoveTag(tag: string) {
    dispatch('removeTag', tag);
  }

  function handleCreateTag() {
    if (searchQuery.trim() && !$notesStore.tags.includes(searchQuery.trim())) {
      dispatch('createTag', searchQuery.trim());
      searchQuery = '';
      showSearchResults = false;
      showTagPicker = false;
    }
  }

  function handleSearchFocus() {
    showSearchResults = true;
  }

  function handleSearchBlur() {
    setTimeout(() => {
      showSearchResults = false;
      showTagPicker = false;
    }, 200);
  }

  function handleSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    searchQuery = input.value;
    showSearchResults = true;
  }
</script>

<div class="tag-manager">
  <div class="selected-tags">
    {#each selectedTags as tag}
      <div class="tag" transition:fade>
        <span class="tag-text">{tag}</span>
        <button
          type="button"
          class="remove-tag"
          on:click={() => handleRemoveTag(tag)}
          title="Remove tag"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    {/each}
    <button
      type="button"
      class="tag add-tag-button"
      on:click={() => (showTagPicker = !showTagPicker)}
      title="Add tag"
    >
      <span class="tag-text">Add Tag</span>
      <span class="add-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
  </div>

  <div class="tag-picker-container">
    {#if showTagPicker}
      <div class="tag-picker" transition:fly={{ y: -10, duration: 200 }}>
        <div class="search-container">
          <input
            type="text"
            bind:value={searchQuery}
            on:input={handleSearchInput}
            on:focus={handleSearchFocus}
            on:blur={handleSearchBlur}
            placeholder="Search or create tag..."
            class="tag-search"
          />
          <button
            type="button"
            class="close-picker"
            on:click={() => (showTagPicker = false)}
            title="Close tag picker"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        {#if showSearchResults}
          <div class="search-results">
            {#if filteredTags.length > 0}
              {#each filteredTags as tag}
                <button
                  type="button"
                  class="tag-option"
                  on:mousedown={() => handleAddTag(tag)}
                >
                  {tag}
                </button>
              {/each}
            {:else if searchQuery.trim()}
              <button
                type="button"
                class="create-tag-option"
                on:mousedown={handleCreateTag}
              >
                Create tag "{searchQuery.trim()}"
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .tag-manager {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-xs);
    margin-top: auto;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    align-items: center;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tag.add-tag-button {
    color: var(--color-accent-blue);
    background-color: var(--color-bg-tertiary);
    border: 1px dashed var(--color-border);
  }

  .tag.add-tag-button:hover {
    background-color: var(--color-bg-elevated);
    border-color: var(--color-accent-blue);
  }

  .tag-text {
    color: var(--color-accent-blue);
  }

  .add-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent-blue);
  }

  .remove-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-muted);
    padding: 2px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .remove-tag:hover {
    color: var(--color-accent-red);
    background-color: var(--color-bg-elevated);
  }

  .tag-picker-container {
    position: relative;
  }

  .tag-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: var(--spacing-xs);
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    width: 250px;
    z-index: 10;
  }

  .search-container {
    padding: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .tag-search {
    flex: 1;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }

  .tag-search:focus {
    outline: none;
    border-color: var(--color-accent-blue);
  }

  .search-results {
    max-height: 200px;
    overflow-y: auto;
    padding: var(--spacing-xs);
  }

  .tag-option,
  .create-tag-option {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 6px 8px;
    color: var(--color-text-secondary);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .tag-option:hover,
  .create-tag-option:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .create-tag-option {
    color: var(--color-accent-blue);
    font-style: italic;
  }

  .create-tag-option:hover {
    color: var(--color-accent-blue);
  }

  .close-picker {
    background: none;
    border: none;
    color: var(--color-text-muted);
    padding: 4px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .close-picker:hover {
    color: var(--color-text-primary);
  }
</style> 