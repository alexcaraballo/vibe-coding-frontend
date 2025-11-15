<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* App Container */
.app-container {
  min-height: 100vh;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  /* Safe area support for webview (iOS notch, Android navigation) */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  /* Safe area support for horizontal padding */
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

/* Tablet */
@media (min-width: 768px) {
  .main-content {
    padding: 1.5rem;
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .main-content {
    padding: 2rem;
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .main-content {
    padding: 2.5rem;
  }
}
</style>
