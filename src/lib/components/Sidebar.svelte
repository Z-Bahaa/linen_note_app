<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  export let isOpen = true;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();
</script>

<div 
  class="sidebar" 
  class:open={isOpen}
  transition:slide={{ duration: 200 }}
>
  <div class="sidebar-header">
    <h1 class="app-title">Linen</h1>
    <button 
      class="collapse-button"
      on:click={() => dispatch('close')}
      title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <div class="sidebar-divider" />
</div>

<style>
  .sidebar {
    width: 280px;
    height: 100vh;
    background-color: var(--color-bg-elevated);
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease;
  }

  .sidebar:not(.open) {
    width: 75px;
  }

  .sidebar-header {
    padding: var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 60px;
  }

  .app-title {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    margin-right: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar:not(.open) .app-title {
    display: none;
  }

  .collapse-button {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .collapse-button:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-tertiary);
  }

  .sidebar:not(.open) .collapse-button {
    transform: rotate(180deg);
    margin: 0 auto;
  }

  .sidebar-divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 0;
  }
</style> 