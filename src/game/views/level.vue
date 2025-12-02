<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();

// 1. 定义关卡数据
// 模拟数据：id, status(locked/unlocked), stars(0-3)
const levels = ref([
  { id: 1, label: '1', locked: false, stars: 3 },
  { id: 2, label: '2', locked: false, stars: 2 },
  { id: 3, label: '3', locked: false, stars: 3 },
  { id: 4, label: '4', locked: false, stars: 1 },
  { id: 5, label: '5', locked: false, stars: 0 }, // 当前正在进行的关卡
  { id: 6, label: '6', locked: true, stars: 0 },
  { id: 7, label: '7', locked: true, stars: 0 },
  { id: 8, label: '8', locked: true, stars: 0 },
  { id: 9, label: '9', locked: true, stars: 0 },
  { id: 10, label: '10', locked: true, stars: 0 },
  { id: 11, label: '11', locked: true, stars: 0 },
  { id: 12, label: '12', locked: true, stars: 0 },
]);

// 控制晃动动画的临时状态
const shakingLevelId = ref(null);

// 2. 处理点击事件
const handleLevelClick = (level) => {
  if (level.locked) {
    // 如果关卡锁定，触发晃动动画
    triggerShake(level.id);
    return;
  }
  
  // 如果关卡解锁，执行进入逻辑
  console.log(`进入关卡 ${level.label}`);
  alert(`开始挑战第 ${level.label} 关！`); 
  router.push({ path: '/onevsone'});
//   router.push({ name: 'Game', params: { id: level.id } })//此处通常对接路由跳转，例如：
};

// 触发晃动效果的辅助函数
const triggerShake = (id) => {
  shakingLevelId.value = id;
  setTimeout(() => {
    shakingLevelId.value = null;
  }, 500); // 500ms后移除动画类
};
</script>

<template>
  <div class="page-container">
    <div class="header">
      <h1>选择关卡</h1>
      <p>当前进度: 5 / 12</p>
    </div>

    <div class="level-grid">
      <div 
        v-for="level in levels" 
        :key="level.id"
        class="level-card"
        :class="{ 
          'is-locked': level.locked, 
          'is-unlocked': !level.locked,
          'shake-animation': shakingLevelId === level.id 
        }"
        @click="handleLevelClick(level)"
      >
        <div v-if="level.locked" class="icon-lock">🔒</div>
        
        <div v-else class="level-content">
          <span class="level-number">{{ level.label }}</span>
          
          <div class="stars" v-if="level.stars > 0">
            <span v-for="n in 3" :key="n" class="star">
              {{ n <= level.stars ? '⭐' : '☆' }}
            </span>
          </div>
          <div v-else class="new-tag">NEW</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器样式：深色游戏背景 */
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.header p {
  color: #a0a0a0;
}

/* 网格布局 */
.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}

/* 关卡卡片基础样式 */
.level-card {
  aspect-ratio: 1; /* 正方形 */
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  user-select: none;
}

/* 解锁状态样式 */
.is-unlocked {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: 2px solid #fff;
  color: #0d253f;
}

.is-unlocked:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.4);
}

.is-unlocked:active {
  transform: scale(0.95);
}

/* 锁定状态样式 */
.is-locked {
  background-color: #2e3440;
  border: 2px solid #4c566a;
  color: #4c566a;
  opacity: 0.8;
}

/* 内容布局 */
.level-number {
  font-size: 2rem;
  font-weight: bold;
}

.icon-lock {
  font-size: 2rem;
  opacity: 0.5;
}

.stars {
  font-size: 0.8rem;
  margin-top: 4px;
  color: #ff9800; /* 金色 */
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.star {
  margin: 0 1px;
}

.new-tag {
  font-size: 0.7rem;
  background: #ff4757;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 5px;
  font-weight: bold;
}

/* 晃动动画 (Shake Animation) */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.shake-animation {
  animation: shake 0.3s ease-in-out;
  border-color: #ff4757; /* 晃动时边框变红 */
}
</style>