<template>
  <div class="game-hud">
    <!-- 左上角：玩家状态 -->
    <div class="player-status">
      <div class="avatar">
        <!-- 暂时用 div 代替图片，或者用现有 assets -->
        <div style="width: 40px; height: 40px; background: #555; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">🧙‍♂️</div>
      </div>
      <div class="bars">
        <div class="bar-container health">
          <div class="bar-fill" :style="{ width: (health / maxHealth * 100) + '%' }"></div>
          <span class="bar-text">{{ Math.ceil(health) }} / {{ maxHealth }}</span>
        </div>
        <div class="bar-container mana">
          <div class="bar-fill" :style="{ width: (knowledge / maxKnowledge * 100) + '%' }"></div>
          <span class="bar-text">{{ Math.ceil(knowledge) }} / {{ maxKnowledge }}</span>
        </div>
      </div>
    </div>

    <!-- 底部：技能栏 -->
    <div class="skill-bar">
      <div 
        v-for="(skill, key, index) in skills" 
        :key="key" 
        class="skill-slot" 
        :class="{ 'on-cooldown': cooldowns[key] > 0, 'disabled': knowledge < skill.cost }"
      >
        <div class="skill-icon">{{ skill.icon }}</div>
        <div class="skill-key">Num {{ index + 1 }}</div>
        <div class="skill-cost">{{ skill.cost }}</div>
        <div v-if="cooldowns[key] > 0" class="cooldown-overlay">
          {{ (cooldowns[key] / 1000).toFixed(1) }}
        </div>
      </div>
    </div>

    <!-- 左下角：战斗日志 -->
    <div class="combat-log">
      <div v-for="(log, index) in logs" :key="index" class="log-entry">
        > {{ log }}
      </div>
    </div>
    
    <!-- 答题模态框 -->
    <div v-if="showQuiz" class="quiz-modal">
      <h3>Knowledge Check!</h3>
      <p class="question">{{ currentQuestion.question }}</p>
      <div class="options">
        <button 
          v-for="(opt, idx) in currentQuestion.options" 
          :key="idx"
          @click="answerQuiz(idx)"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- 游戏结束/菜单 -->
    <div v-if="gameOver" class="game-over-modal">
      <h2>GAME OVER</h2>
      <button @click="restartGame">Try Again</button>
    </div>
    
    <div class="system-controls">
       <button @click="handlePause">⏸</button>
       <button @click="handleResume">▶</button>
       <button @click="restartGame">↺</button>
    </div>

    <div class="player-status enemy-status">
      <div class="avatar enemy-avatar">
        <div style="width: 40px; height: 40px; background: #800; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">🤖</div>
      </div>
      <div class="bars">
        <div class="bar-container health">
          <div class="bar-fill" :style="{ width: (enemyHealth / maxEnemyHealth * 100) + '%' }"></div>
          <span class="bar-text">{{ Math.ceil(enemyHealth) }} / {{ maxEnemyHealth }}</span>
        </div>
      </div>
    </div>

    <!-- 右上角：操作指南 -->
    <div class="controls-legend">
        <h3>Controls</h3>
        <div>Move: WASD</div>
        <div>Attack: Num 0</div>
        <div>Block: Num .</div>
        <div>Skills: Num 1-5</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import eventBus from '@/game/utils/eventBus';
import { SKILLS } from '@/game/data/skills';
import { QUESTIONS } from '@/game/data/questions';

const props = defineProps({
  gameControls: Object
});

const health = ref(100);
const maxHealth = ref(100);
const knowledge = ref(100);
const maxKnowledge = ref(100);
const enemyHealth = ref(100);
const maxEnemyHealth = ref(100);
const gameOver = ref(false);
const logs = ref([]);
const skills = SKILLS;
const cooldowns = reactive({}); // key: skillId, value: remaining ms

// Quiz state
const showQuiz = ref(false);
const currentQuestion = ref(null);
let quizCallback = null;

// Timer for cooldown updates
let cooldownInterval = null;

onMounted(() => {
  eventBus.on('player-stats-update', (data) => {
    if (data.isAI) {
        enemyHealth.value = data.health;
        maxEnemyHealth.value = data.maxHealth;
    } else {
        health.value = data.health;
        maxHealth.value = data.maxHealth;
        knowledge.value = data.knowledge;
        maxKnowledge.value = data.maxKnowledge;
    }
  });

  eventBus.on('game-over', () => {
    gameOver.value = true;
  });
  
  eventBus.on('combat-log', (msg) => {
    logs.value.push(msg);
    if (logs.value.length > 5) logs.value.shift();
  });
  
  eventBus.on('skill-used', ({ skillId, cooldown }) => {
    cooldowns[skillId] = cooldown;
  });
  
  eventBus.on('trigger-quiz', (callback) => {
      // 随机选题
      const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      currentQuestion.value = q;
      showQuiz.value = true;
      quizCallback = callback;
      // 暂停游戏
      if (props.gameControls) props.gameControls.pause();
  });

  // Cooldown countdown loop
  cooldownInterval = setInterval(() => {
    for (const key in cooldowns) {
      if (cooldowns[key] > 0) {
        cooldowns[key] -= 100;
        if (cooldowns[key] < 0) cooldowns[key] = 0;
      }
    }
  }, 100);
});

onUnmounted(() => {
  eventBus.all.clear();
  if (cooldownInterval) clearInterval(cooldownInterval);
});

const answerQuiz = (index) => {
    const isCorrect = index === currentQuestion.value.correctIndex;
    showQuiz.value = false;
    
    // 恢复游戏
    if (props.gameControls) props.gameControls.resume();
    
    if (quizCallback) {
        quizCallback(isCorrect);
        quizCallback = null;
    }
};

const handlePause = () => {
  if (props.gameControls) props.gameControls.pause();
};

const handleResume = () => {
  if (props.gameControls) props.gameControls.resume();
};

const restartGame = () => {
  gameOver.value = false;
  health.value = 100;
  knowledge.value = 100;
  logs.value = [];
  if (props.gameControls) props.gameControls.restart();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.game-hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-family: 'Share Tech Mono', 'Consolas', monospace;
  user-select: none;
  color: #cef;
}

.game-hud > * {
  pointer-events: auto;
}

.player-status {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 15px;
  background: rgba(16, 24, 32, 0.85);
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #3498db;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
  backdrop-filter: blur(4px);
}

.enemy-status {
  top: 20px;
  left: auto;
  right: 150px;
  flex-direction: row-reverse;
  border-color: #e74c3c;
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.3);
}

.avatar {
  border: 2px solid #3498db;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
}

.enemy-status .avatar {
    border-color: #e74c3c;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
  justify-content: center;
}

.bar-container {
  height: 20px;
  background: #111;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #333;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 5px rgba(0,0,0,0.5);
}

.health .bar-fill { 
    background: linear-gradient(90deg, #c0392b, #e74c3c);
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.6);
}

.mana .bar-fill { 
    background: linear-gradient(90deg, #2980b9, #3498db);
    box-shadow: 0 0 10px rgba(52, 152, 219, 0.6);
}

.bar-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  font-weight: bold;
  letter-spacing: 1px;
}

.skill-bar {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: rgba(16, 24, 32, 0.8);
  padding: 15px 25px;
  border-radius: 10px;
  border: 1px solid #444;
  box-shadow: 0 0 20px rgba(0,0,0,0.8);
}

.skill-slot {
  width: 70px;
  height: 70px;
  background: #222;
  border: 2px solid #555;
  border-radius: 8px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}

.skill-slot:hover {
    border-color: #f1c40f;
    box-shadow: 0 0 15px rgba(241, 196, 15, 0.4);
    transform: translateY(-5px);
}

.skill-slot:active {
    transform: scale(0.95);
    background: #333;
}

.skill-slot.disabled {
  opacity: 0.6;
  filter: grayscale(100%);
  cursor: not-allowed;
  border-color: #333;
}

.skill-key {
  position: absolute;
  top: -10px;
  left: -10px;
  background: #111;
  color: #f1c40f;
  border: 1px solid #f1c40f;
  width: 24px;
  height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  z-index: 2;
}

.skill-cost {
  position: absolute;
  bottom: 2px;
  right: 4px;
  color: #3498db;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 2px black;
}

.cooldown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  border-radius: 6px;
  backdrop-filter: blur(2px);
}

.combat-log {
  position: absolute;
  bottom: 140px;
  left: 20px;
  width: 350px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #f1c40f;
  color: #ddd;
  font-size: 13px;
  max-height: 200px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column-reverse;
  font-family: 'Consolas', monospace;
}

.log-entry {
    margin-bottom: 4px;
    border-bottom: 1px solid #333;
    padding-bottom: 2px;
}

.quiz-modal {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(16, 24, 32, 0.95);
  padding: 30px;
  border-radius: 12px;
  border: 2px solid #f1c40f;
  width: 600px;
  color: white;
  z-index: 1000;
  box-shadow: 0 0 50px rgba(0,0,0,0.9);
}

.quiz-modal h3 {
    margin-top: 0;
    color: #f1c40f;
    border-bottom: 1px solid #555;
    padding-bottom: 15px;
    font-size: 24px;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.question {
    font-size: 20px;
    margin: 25px 0;
    line-height: 1.4;
    color: #ecf0f1;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
}

.options button {
  padding: 20px;
  background: #2c3e50;
  border: 1px solid #34495e;
  color: #bdc3c7;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
  font-family: inherit;
}

.options button:hover {
  background: #34495e;
  color: #fff;
  border-color: #f1c40f;
  box-shadow: 0 0 10px rgba(241, 196, 15, 0.3);
  transform: translateY(-2px);
}

.controls-legend {
  position: absolute;
  top: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #aaa;
  padding: 15px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #444;
}

.controls-legend h3 {
    color: #f1c40f;
    margin-bottom: 10px;
}
</style>
