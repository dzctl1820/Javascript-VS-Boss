// src/game/objects/Player.js
import Phaser from 'phaser';
import eventBus from '../utils/eventBus';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fighter');
        
        // 将精灵添加到场景和物理系统中
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- 属性设置 ---
        this.health = 100;
        this.speed = 150;
        this.jumpPower = 300;
        this.attackDamage = 20;
        
        // --- 状态标志 ---
        this.isAttacking = false;
        this.isBlocking = false;

        // --- 物理属性 ---
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setGravityY(500); // 重力

        // --- 攻击判定框 ---
        // 创建一个不可见的矩形用于检测攻击范围
        this.attackHitbox = new Phaser.Geom.Rectangle(0, 0, 50, 50);

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

    update(cursors, attackKey, blockKey) {
        // 如果正在攻击或格挡，禁止移动
        if (this.isAttacking || this.isBlocking) {
            this.setVelocityX(0);
            
            // 处理格挡状态
            if (blockKey.isDown) {
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
        if (blockKey.isDown) {
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
        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true); // 向左翻转
            if (this.body.onFloor()) this.play('walk', true);
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.setFlipX(false); // 向右
            if (this.body.onFloor()) this.play('walk', true);
        } else {
            this.setVelocityX(0);
            if (this.body.onFloor()) this.play('idle', true);
        }

        // --- 跳跃逻辑 ---
        if (cursors.up.isDown && this.body.onFloor()) {
            this.setVelocityY(-this.jumpPower);
            this.play('jump', true);
        }

        // --- 攻击逻辑 ---
        if (Phaser.Input.Keyboard.JustDown(attackKey)) {
            this.isAttacking = true;
            this.play('attack');
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
        
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        this.updateHealthUI();
        
        if (this.health === 0) {
            // 触发死亡事件
            eventBus.emit('game-over', { winner: 'Opponent' });
        }
    }

    updateHealthUI() {
        // 发送事件给 Vue 组件
        eventBus.emit('player-health-update', { health: this.health });
    }

    getAttackHitbox() {
        return this.attackHitbox;
    }
}