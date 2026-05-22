<script setup>
import UiHeader from '../components/UiHeader.vue'
import { useRouter } from 'vue-router'
import { getSessionUser, clearSessionUser } from '../utils/authSession.js'

const router = useRouter()



function onContinue() {
  if (!getSessionUser()) {
    clearSessionUser()
    router.replace({ name: 'login' })
    return
  }
}

function logout() {
  clearSessionUser()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="container-principal">
    <UiHeader />

    <div class="container-content">
      <div class="principal-outlet">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" @logout="logout" @continue="onContinue" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>

.principal-outlet {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.container-content {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: var(--space-md);
}

@media (min-width: 900px) {
  .container-content {
    padding: var(--space-lg);
    gap: var(--space-xl);
  }
}


</style>
