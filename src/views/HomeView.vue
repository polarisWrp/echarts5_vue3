<template>
  <div class="home-view">
    <TotalCharts></TotalCharts>
  </div>
</template>

<script setup lang="ts">
import TotalCharts from '@/views/TotalCharts/index.vue';
// import router from '@/router/index';
import { onMounted } from 'vue';

onMounted(() => {
  // router.push('./TotalCharts/index.vue');s
});
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
