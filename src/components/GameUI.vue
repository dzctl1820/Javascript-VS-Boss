<template>
  <div class="ui-panel">
    <div class="health-container">
      <div class="label">P1 Health</div>
      <div class="bar-bg">
        <div class="bar-fill" :style="{ width: health + '%' }"></div>
      </div>
    </div>

    <div v-if="gameOver" class="game-over-modal">
      <h2>GAME OVER</h2>
      <button @click="restartGame">Try Again</button>
    </div>

    <div class="controls">
      <button @click="handlePause">暂停</button>
      <button @click="handleResume">继续</button>
      <button @click="restartGame">重置</button>
    </div>

    <div class="tips">
      操作: 方向键移动/跳跃, Z 键攻击, X 键格挡
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import eventBus from '@/game/utils/eventBus';

// 定义 Props (JS 写法)
const props = defineProps({
  gameControls: Object // 接收父组件传来的 GameContainer 引用
});

const health = ref(100);
const gameOver = ref(false);

onMounted(() => {
  // 监听血量变化
  eventBus.on('player-health-update', (data) => {
    health.value = data.health;
  });

  // 监听游戏结束
  eventBus.on('game-over', () => {
    gameOver.value = true;
  });
});

onUnmounted(() => {
  eventBus.all.clear();
});

const handlePause = () => {
  if (props.gameControls) props.gameControls.pause();
};

const handleResume = () => {
  if (props.gameControls) props.gameControls.resume();
};

const restartGame = () => {
  gameOver.value = false;
  health.value = 100;
  if (props.gameControls) props.gameControls.restart();
};
</script>

<style scoped>
.ui-panel {
  width: 800px;
  margin: 20px auto;
  text-align: center;
  position: relative;
}

.health-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.bar-bg {
  flex: 1;
  height: 20px;
  background: #333;
  border: 2px solid #555;
}

.bar-fill {
  height: 100%;
  background: #ff0000;
  transition: width 0.2s;
}

.controls button {
  padding: 8px 16px;
  margin: 0 5px;
  cursor: pointer;
  background: #444;
  color: #fff;
  border: none;
  border-radius: 4px;
}

.controls button:hover {
  background: #666;
}

.game-over-modal {
  position: absolute;
  top: -400px; /* 显示在游戏画面上方的大概位置 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  padding: 40px;
  color: white;
  z-index: 100;
}

.tips {
  margin-top: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>