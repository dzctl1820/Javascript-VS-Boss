<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="login-card">
      <div class="game-title">
        <h1>猛攻</h1>
        <div class="subtitle">BATTLE ARENA</div>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username">战士名称</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="输入你的战士名称"
            required
            maxlength="20"
            class="game-input"
          />
          <div class="input-error" v-if="error">{{ error }}</div>
        </div>
        
        <button type="submit" class="battle-button" :disabled="!username.trim()">
          <span class="button-text">进入战场</span>
          <div class="button-glow"></div>
        </button>
      </form>
      
      <div class="game-stats">
        <div class="stat-item">
          <div class="stat-number">1.2K</div>
          <div class="stat-label">在线战士</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">45</div>
          <div class="stat-label">激烈战斗中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const error = ref('')

const handleLogin = () => {
  if (!username.value.trim()) {
    error.value = '请输入战士名称'
    return
  }
  
  if (username.value.trim().length < 2) {
    error.value = '战士名称至少需要2个字符'
    return
  }
  
  // 存储用户名到本地存储
  localStorage.setItem('playerName', username.value.trim())
  
  // 跳转到游戏页面
  router.push({ path: '/level' })
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/background.png');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  filter: brightness(0.7) contrast(1.2);
}

.login-card {
  position: relative;
  background: rgba(20, 20, 35, 0.9);
  border-radius: 20px;
  padding: 3rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: cardAppear 0.6s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.game-title {
  text-align: center;
  margin-bottom: 2.5rem;
}

.game-title h1 {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(238, 90, 36, 0.5);
  letter-spacing: 2px;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    filter: brightness(1);
  }
  to {
    filter: brightness(1.2);
  }
}

.subtitle {
  font-size: 0.9rem;
  color: #888;
  letter-spacing: 4px;
  margin-top: 0.5rem;
  font-weight: 300;
}

.login-form {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 1px;
}

.game-input {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.game-input:focus {
  outline: none;
  border-color: #ff6b6b;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
}

.game-input::placeholder {
  color: #666;
}

.input-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.battle-button {
  position: relative;
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
}

.battle-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(238, 90, 36, 0.4);
}

.battle-button:active:not(:disabled) {
  transform: translateY(0);
}

.battle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.battle-button:hover:not(:disabled) .button-glow {
  left: 100%;
}

.game-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
  letter-spacing: 1px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem;
    margin: 1rem;
  }
  
  .game-title h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 0.8rem;
  }
}
</style>