<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let isSidebarOpen = true;

  function handleSidebarClose() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<svelte:head>
  <title>Linen Notes</title>
</svelte:head>

<div class="app-container">
  <Sidebar 
    bind:isOpen={isSidebarOpen} 
    on:close={handleSidebarClose}
  />
  
  <main class:sidebar-open={isSidebarOpen}>
    <slot />
  </main>
</div>

<style>
  .app-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--color-bg-primary);
    gap: 0;
    width: 100%;
  }

  main {
    flex: 1 1 auto;
    min-width: 0;
    width: calc(100% - var(--sidebar-width));
    transition: width 0.2s ease, margin-left 0.2s ease;
    margin-left: 0;
  }

  :global(:root) {
    --sidebar-width: 280px;
  }

  main.sidebar-open {
    width: calc(100% - var(--sidebar-width));
  }

  main:not(.sidebar-open) {
    width: calc(100% - 75px);
  }
</style> 