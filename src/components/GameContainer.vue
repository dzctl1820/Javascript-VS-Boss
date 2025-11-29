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
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border: 4px solid #333;
  border-radius: 8px;
  overflow: hidden;
}
</style>