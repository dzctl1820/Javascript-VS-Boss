<template>
  <div class="game-page">
    <GameContainer ref="gameContainerRef" />
    <GameUI :game-controls="gameContainerRef" />
    <!-- <Tab /> -->
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// import Tab from '@/components/Tab.vue';
import GameContainer from '@/components/GameContainer.vue';
import GameUI from '@/components/GameUI.vue';
const gameContainerRef = ref(null);


const isTab = ref(false);

// const keydownHandler = (event) => {
//   if (event.key === 'Tab') {
//     event.preventDefault();
//     isTab.value = true;
//   }
// };

// onMounted(() => {
//   window.addEventListener('keydown', keydownHandler);
// });
// onUnmounted(() => {
//   window.removeEventListener('keydown', keydownHandler);
// });
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: #1a1a1a;
  color: #eee;
  font-family: sans-serif;
  overflow: hidden;
}

.game-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>