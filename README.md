# JavaScript Combat Arena (JS VS Boss)

一款结合了 JavaScript 编程知识的横版格斗游戏。玩家扮演一名程序员战士，利用各种 JS 概念（如作用域、Promise、异步、闭包等）作为技能，与 AI 对手进行代码层面的较量。

![Game Screenshot](public/vite.svg) <!-- 之后可以替换为游戏截图 -->

## 🎮 游戏特色

-   **编程技能系统**：所有技能均基于 JavaScript 核心概念设计。
    -   `Scope Strike`: 利用作用域发射光波。
    -   `Promise Shield`: 创建承诺护盾抵挡伤害。
    -   `Async/Await`: 强制让敌人进入等待状态（冰冻）。
    -   `this.flash()`: 改变 `this` 上下文进行瞬间移动。
    -   `Garbage Collection`: 终极技能，通过回答 JS 技术问题触发强大的垃圾回收机制。
-   **知识问答**：释放大招需要正确回答随机抽取的 JavaScript 面试题（共 25+ 题，涵盖 ES6、原型链、事件循环等）。
-   **智能 AI**：具备自动寻路、攻击、格挡和跳跃逻辑的 AI 对手。
-   **趣味视觉效果**：
    -   伤害数字会随机变成 `NaN`, `undefined`, `[object Object]` 等 JS 梗。
    -   技能冷却和错误提示模仿浏览器控制台报错（`Uncaught ReferenceError`）。
    -   炫酷的粒子特效和屏幕震动。

## 🕹️ 操作指南

建议使用全尺寸键盘（带小数字键盘）。

### 移动 (左手)
-   **W**: 跳跃 / 二段跳
-   **A**: 向左移动
-   **S**: 下蹲/下落
-   **D**: 向右移动

### 战斗 (右手 - 小数字键盘)
-   **Num 0**: 普通攻击 (Attack)
-   **Num .**: 格挡 (Block) - 减少 80% 伤害

### 技能 (右手 - 小数字键盘)
| 按键 | 技能名称 | 消耗 (Knowledge) | 冷却 | 描述 |
| --- | --- | --- | --- | --- |
| **Num 1** | Scope Strike | 10 | 1s | 基础远程伤害 |
| **Num 2** | Promise Shield | 20 | 5s | 3秒内抵挡一次攻击 |
| **Num 3** | Async/Await | 30 | 8s | 冰冻敌人 2 秒 |
| **Num 4** | Garbage Collection | 50 | 15s | **终极技能**：答题触发全屏特效（栈溢出、闭包陷阱等） |
| **Num 5** | this.flash() | 15 | 3s | 瞬间移动一段距离 |

## 🛠️ 技术栈

-   **核心框架**: [Phaser 3](https://phaser.io/) (游戏引擎)
-   **UI 框架**: [Vue 3](https://vuejs.org/) (用于 HUD、弹窗和状态管理)
-   **构建工具**: [Vite](https://vitejs.dev/)
-   **语言**: JavaScript (ES6+)

## 🚀 快速开始

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动开发服务器**
    ```bash
    npm run dev
    ```

3.  **构建生产版本**
    ```bash
    npm run build
    ```

## 📁 目录结构

-   `src/game/scenes`: Phaser 场景逻辑 (MainScene)
-   `src/game/objects`: 游戏对象 (Player, Projectile)
-   `src/game/data`: 游戏数据 (技能配置, 题库)
-   `src/components`: Vue UI 组件 (HUD, 答题弹窗)
-   `src/assets`: 游戏资源

## 📝 待办 / 计划

- [ ] 增加更多关卡和不同类型的 Bug Boss
- [ ] 添加在线对战模式
- [ ] 丰富题库，支持自定义题目导入

---
*Happy Coding & Fighting!*
