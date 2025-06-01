<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title = '';
  export let message = '';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let type: 'danger' | 'warning' | 'info' = 'info';

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  function handleConfirm() {
    dispatch('confirm');
    show = false;
  }

  function handleCancel() {
    dispatch('cancel');
    show = false;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
</script>

{#if show}
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick}
    transition:fade={{ duration: 150 }}
  >
    <div 
      class="modal" 
      class:type-{type}
      transition:fly={{ y: 20, duration: 200 }}
    >
      <h3 class="modal-title">{title}</h3>
      <p class="modal-message">{message}</p>
      <div class="modal-actions">
        <button 
          class="modal-button cancel" 
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        <button 
          class="modal-button confirm" 
          class:type-{type}
          on:click={handleConfirm}
        >
          {confirmText}
        </button>
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
    background-color: var(--color-bg-elevated);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    width: 90%;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
  }

  .modal-title {
    font-family: var(--font-mono);
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-md) 0;
  }

  .modal-message {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 var(--spacing-lg) 0;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
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

  .modal-button.confirm {
    border: none;
    color: var(--color-bg-elevated);
  }

  .modal-button.confirm.type-danger {
    background-color: var(--color-accent-red);
  }

  .modal-button.confirm.type-warning {
    background-color: var(--color-accent-yellow);
  }

  .modal-button.confirm.type-info {
    background-color: var(--color-accent-blue);
  }

  .modal-button.confirm:hover {
    opacity: 0.9;
  }

  .modal.type-danger .modal-title {
    color: var(--color-accent-red);
  }

  .modal.type-warning .modal-title {
    color: var(--color-accent-yellow);
  }

  .modal.type-info .modal-title {
    color: var(--color-accent-blue);
  }
</style> 