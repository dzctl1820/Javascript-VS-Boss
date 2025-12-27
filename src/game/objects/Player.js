// src/game/objects/Player.js
import Phaser from 'phaser';
import eventBus from '../utils/eventBus';
import { SKILLS } from '../data/skills';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, isAI = false) {
        super(scene, x, y, 'fighter');
        
        // 将精灵添加到场景和物理系统中
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- 属性设置 ---
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxKnowledge = 100;
        this.knowledge = this.maxKnowledge;
        this.skillCooldowns = {};

        this.speed = 150;
        this.jumpPower = 300;
        this.attackDamage = 5;
        
        // --- 状态标志 ---
        this.isAttacking = false;
        this.isBlocking = false;
        
        // --- AI 相关 ---
        this.isAI = isAI;
        this.aiTimer = 0;
        this.aiNextDecisionTime = 0;
        this.aiInput = {
            left: false,
            right: false,
            up: false,
            down: false,
            attack: false,
            block: false,
            jump: false
        };
        
        // --- 二段跳相关 ---
        this.maxJumps = 2; // 最大跳跃次数
        this.jumpCount = 0; // 当前已跳跃次数

        // --- 物理属性 ---
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setGravityY(500); // 重力

        // --- 攻击判定框 ---
        // 创建一个不可见的矩形用于检测攻击范围
        this.attackHitbox = new Phaser.Geom.Rectangle(0, 0, 2, 2);

        this.initAnimations();
        this.updateHealthUI();
    }

    initAnimations() {
        // 确保你的精灵图帧数索引是正确的
        const anims = this.scene.anims;

        // 站立
        if (!anims.exists('idle')) {
            anims.create({
                key: 'idle',
                frames: anims.generateFrameNumbers('fighter', { start: 6, end: 6 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // 行走
        if (!anims.exists('walk')) {
            anims.create({
                key: 'walk',
                frames: anims.generateFrameNumbers('fighter', { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // 跳跃
        if (!anims.exists('jump')) {
            anims.create({
                key: 'jump',
                frames: anims.generateFrameNumbers('fighter', { start: 3, end: 4 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // 攻击
        if (!anims.exists('attack')) {
            anims.create({
                key: 'attack',
                frames: anims.generateFrameNumbers('fighter', { start: 7, end: 9 }),
                frameRate: 15,
                repeat: 0
            });
        }

        //格挡
        if (!anims.exists('block')) {
            anims.create({
                key: 'block',
                frames: anims.generateFrameNumbers('fighter', { start: 5, end: 5 }),
                frameRate: 15,
                repeat: 0
            });
        }

        // 监听动画完成事件，攻击完回到站立
        this.on('animationcomplete-attack', () => {
            this.isAttacking = false;
            this.play('idle', true);
        });

        this.play('idle');
    }

    updateAI(target) {
        if (!target || !target.active) return;

        const time = this.scene.time.now;
        
        // 简单的 AI 决策间隔 (每 100-300ms 更新一次决策)
        if (time < this.aiNextDecisionTime) {
            // 重置单次触发的按键
            this.aiInput.attack = false;
            this.aiInput.jump = false;
            return;
        }
        
        this.aiNextDecisionTime = time + Phaser.Math.Between(100, 300);

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.abs(dx);
        const attackRange = 60;

        // 重置输入
        this.aiInput.left = false;
        this.aiInput.right = false;
        this.aiInput.block = false;
        this.aiInput.jump = false;
        this.aiInput.attack = false;

        // 1. 移动逻辑
        if (dist > attackRange) {
            // 远离目标时，靠近
            if (dx > 0) this.aiInput.right = true;
            else this.aiInput.left = true;
        } else {
            // 距离够近，有几率停止或微调
             // 50% 概率格挡
             if (Math.random() > 0.5) this.aiInput.block = true;
        }

        // 2. 攻击逻辑
        if (dist <= attackRange && Math.abs(dy) < 50) {
            // 在攻击范围内且高度相近
            // 70% 概率攻击
            if (Math.random() < 0.7) {
                this.aiInput.attack = true;
                this.aiInput.block = false; // 攻击时不能格挡
            }
        }

        // 3. 跳跃逻辑
        // 如果目标在上方，或者随机跳跃
        if (target.y < this.y - 50 || (Math.random() < 0.05)) {
             this.aiInput.jump = true;
        }
    }

    update(cursors, attackKey, blockKey, jumpKey) {
        let input = {
            left: false,
            right: false,
            up: false,
            down: false,
            attack: false,
            block: false,
            jump: false
        };

        if (this.isAI) {
            input = this.aiInput;
        } else if (cursors) {
            input.left = cursors.left.isDown;
            input.right = cursors.right.isDown;
            input.up = cursors.up.isDown;
            input.down = cursors.down.isDown;
            input.block = blockKey.isDown;
            // 对于人类玩家，这里 JustDown 需要在这里判断，或者传入参数已经是 boolean?
            // 原代码传入的是 Key 对象，所以这里保持 Key 对象的判断
            input.attack = Phaser.Input.Keyboard.JustDown(attackKey);
            input.jump = jumpKey && Phaser.Input.Keyboard.JustDown(jumpKey);
        }

        // 如果正在攻击或格挡，禁止移动
        if (this.isAttacking || this.isBlocking) {
            this.setVelocityX(0);
            
            // 处理格挡状态
            if (input.block) {
                this.isBlocking = true;
                this.setTint(0x888888); // 变灰表示格挡
                if (this.body.onFloor()) this.play('block', true);
            } else {
                this.isBlocking = false;
                this.clearTint();
            }
            
            return;
        }

        // 检查格挡键 (即使不在移动中)
        if (input.block) {
            this.isBlocking = true;
            this.setVelocityX(0);
            this.setTint(0x888888);
            if (this.body.onFloor()) this.play('block', true);
            return; 
        } else {
            this.isBlocking = false;
            this.clearTint();
        }

        // --- 移动逻辑 ---
        if (input.left) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true); // 向左翻转
            if (this.body.onFloor()) this.play('walk', true);
        } else if (input.right) {
            this.setVelocityX(this.speed);
            this.setFlipX(false); // 向右
            if (this.body.onFloor()) this.play('walk', true);
        } else {
            this.setVelocityX(0);
            if (this.body.onFloor()) this.play('idle', true);
        }

        // --- 跳跃逻辑（支持二段跳）---
        // 当角色落地时重置跳跃次数
        if (this.body.onFloor()) {
            this.jumpCount = 0;
        }
        
        // 按下跳跃键且未达到最大跳跃次数
        // 注意：Human input.jump 是 JustDown 的结果，AI input.jump 是一次性触发
        if (input.jump && this.jumpCount < this.maxJumps) {
            this.setVelocityY(-this.jumpPower);
            this.play('jump', true);
            this.jumpCount++; // 增加跳跃计数
            if (this.isAI) this.aiInput.jump = false; // AI 跳跃后立即重置
        }

        // --- 攻击逻辑 ---
        if (input.attack) {
            this.isAttacking = true;
            this.play('attack');
            if (this.isAI) this.aiInput.attack = false; // AI 攻击后立即重置
        }
        
        // --- 更新攻击判定框位置 ---
        if (this.flipX) {
            // 面向左
            this.attackHitbox.x = this.x - this.width / 2 - this.attackHitbox.width;
        } else {
            // 面向右
            this.attackHitbox.x = this.x + this.width / 2;
        }
        this.attackHitbox.y = this.y - this.attackHitbox.height / 2;
    }

    takeDamage(amount) {
        if (this.isBlocking) {
            amount = Math.floor(amount * 0.2); // 格挡减伤80%
        }
        
        this.showDamageText(amount);

        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        this.updateStatsUI();
        
        if (this.health === 0) {
            // 触发死亡事件
            eventBus.emit('game-over', { winner: 'Opponent' });
        }
    }

    updateStatsUI() {
        // 发送事件给 Vue 组件
        eventBus.emit('player-stats-update', { 
            isAI: this.isAI,
            health: this.health,
            maxHealth: this.maxHealth,
            knowledge: this.knowledge,
            maxKnowledge: this.maxKnowledge
        });
    }
    
    showDamageText(amount) {
        // JS 主题的伤害显示
        const jsTerms = ['NaN', 'undefined', 'null', '[object Object]', '!false', 'void 0'];
        let displayAmount = `-${amount}`;
        let color = '#ff0000';
        let fontSize = '32px';

        // 30% 概率出现 JS 梗
        if (Math.random() < 0.3) {
            const term = jsTerms[Math.floor(Math.random() * jsTerms.length)];
            displayAmount = `${term}\n(-${amount})`;
            color = '#f1c40f'; // 金黄色
            fontSize = '24px';
        }

        // 动态伤害数字
        const text = this.scene.add.text(this.x, this.y - 50, displayAmount, {
            font: `bold ${fontSize} "Courier New", monospace`,
            fill: color,
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);
        
        text.setScale(0);

        // 1. 弹出动画
        this.scene.tweens.add({
            targets: text,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            ease: 'Back.out',
            onComplete: () => {
                // 2. 飘起消失
                this.scene.tweens.add({
                    targets: text,
                    y: this.y - 150,
                    alpha: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => text.destroy()
                });
            }
        });
    }
    
    regenerateKnowledge() {
        if (this.knowledge < this.maxKnowledge) {
            this.knowledge += 5;
            if (this.knowledge > this.maxKnowledge) this.knowledge = this.maxKnowledge;
            this.updateStatsUI();
        }
    }

    canUseSkill(skillId) {
        const skill = SKILLS[skillId];
        if (!skill) return false;
        
        const now = this.scene.time.now;
        const cooldown = this.skillCooldowns[skillId] || 0;
        
        if (now < cooldown) {
            eventBus.emit('combat-log', `Uncaught ReferenceError: ${skill.name} is not ready (cooling down...)`);
            return false;
        }
        
        if (this.knowledge < skill.cost) {
            eventBus.emit('combat-log', `Uncaught RangeError: Insufficient Knowledge (required: ${skill.cost})`);
            return false;
        }
        
        return true;
    }

    useSkill(skillId) {
        if (!this.canUseSkill(skillId)) return false;
        
        const skill = SKILLS[skillId];
        this.knowledge -= skill.cost;
        this.skillCooldowns[skillId] = this.scene.time.now + skill.cooldown;
        
        this.updateStatsUI();
        // 这里的 cooldown 传给 UI 用于显示转圈圈
        eventBus.emit('skill-used', { skillId, cooldown: skill.cooldown });
        eventBus.emit('combat-log', `> Executing ${skill.name}()...`);
        
        return true;
    }

    updateHealthUI() {
        this.updateStatsUI();
    }

    getAttackHitbox() {
        return this.attackHitbox;
    }
}