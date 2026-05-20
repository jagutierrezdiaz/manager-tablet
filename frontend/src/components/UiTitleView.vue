<template>
    <div class="ui-title-view">
        <div class="text-title" :class="[colorCard]">
            {{ titleOTM?.charAt(0).toUpperCase() || '' }}
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
    gap: 25px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
}
.text-title {
    width: fit-content;
    min-width: 80px;
    padding: 10px;
    border-radius: 5px;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
}
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.content h3 {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
}
.content h4 {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
}
</style>