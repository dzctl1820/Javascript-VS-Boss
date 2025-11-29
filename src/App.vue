<template>
  <div class="app-container">
    <h1>猛攻</h1>
    
    <GameContainer ref="gameContainerRef" />
    
    <GameUI :game-controls="gameContainerRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GameContainer from './components/GameContainer.vue';
import GameUI from './components/GameUI.vue';

const gameContainerRef = ref(null);
</script>

<style>
body {
  margin: 0;
  background: #1a1a1a;
  color: #eee;
  font-family: sans-serif;
}
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}
</style>