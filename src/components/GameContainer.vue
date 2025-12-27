<template>
  <div id="phaser-container" ref="gameRef"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { initPhaserGame, getGame } from '@/game';
import eventBus from '@/game/utils/eventBus';

const gameRef = ref(null);

onMounted(() => {
  // 初始化游戏，传入 DOM 元素
  initPhaserGame(gameRef.value);
});

onUnmounted(() => {
  const game = getGame();
  if (game) {
    game.destroy(true);
  }
});

// 暴露控制方法给父组件
const pause = () => eventBus.emit('game-pause');
const resume = () => eventBus.emit('game-resume');
const restart = () => eventBus.emit('game-start');

defineExpose({ pause, resume, restart });
</script>

<style scoped>
#phaser-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>