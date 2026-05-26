<template>
    <div class="ui-title-view">
        <div class="text-title" :class="[colorCard]">
            {{ String(titleOTM || '').charAt(0).toUpperCase() }}
        </div>
        <div class="content">
            <h3>{{ titleActivity || 'Sin título' }}</h3>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    titleOTM: {
        type: String,
        required: true
    },
    titleActivity: {
        type: String,
        required: true
    },
    colorCard: {
        type: String,
        required: true
    }
})
</script>

<style scoped>
.ui-title-view {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-md) 0;
    margin-bottom: var(--space-lg);
}
.text-title {
    width: 80px;
    height: 80px;
    padding: var(--space-md);
    border-radius: var(--radius);
    color: white;
    font-size: 2rem;
    font-weight: 800;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-md);
}
.content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}
.content h3 {
    font-size: 1.75rem;
    font-weight: 800;
    text-align: left;
    color: var(--color-text);
    margin: 0;
}
.content h4 {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: left;
    color: var(--color-muted);
    margin: 4px 0 0 0;
}

@media (max-width: 768px) {
    .ui-title-view {
        gap: var(--space-md);
    }
    .text-title {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
    }
    .content h3 {
        font-size: 1.4rem;
    }
}
</style>