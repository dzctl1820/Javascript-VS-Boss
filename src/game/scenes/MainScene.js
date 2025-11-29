// src/game/scenes/MainScene.js
import Phaser from 'phaser';
import { Player } from '../objects/Player';
import eventBus from '../utils/eventBus';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.player1 = null;
        this.player2 = null;
    }

    preload() {
        // 加载资源
        this.load.image('background', 'assets/background.png');
        // 假设精灵图：单帧宽高 64x64
        this.load.spritesheet('fighter', 'assets/fighter.png', { frameWidth: 66, frameHeight: 64 });
    }

    create() {
        // 1. 创建背景
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background')
            .setOrigin(0.5)
            .setDisplaySize(width, height);

        // 2. 创建地面 (不可见物理体)
        const ground = this.add.rectangle(width / 2, height - 50, width, 40, 0x000000, 0);
        this.physics.add.existing(ground, true); // true = 静态物体

        // 3. 创建玩家 1
        this.player1 = new Player(this, 200, height - 200);
        this.player1.setTint(0xff0000); // 染红以区分

        // 4. 创建玩家 2 (简化版 AI / 沙袋)
        this.player2 = new Player(this, width - 200, height - 100);
        this.player2.setFlipX(true);
        this.player2.setTint(0x0000ff); // 染蓝
        
        // 5. 设置碰撞
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.player1, this.player2);

        // 6. 输入按键绑定
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            attack: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
            block: Phaser.Input.Keyboard.KeyCodes.DOWN
        });

        // 7. 监听 Vue 发来的事件
        eventBus.on('game-pause', () => this.pauseGame());
        eventBus.on('game-resume', () => this.resumeGame());
        eventBus.on('game-start', () => this.restartGame());
    }

    update() {
        // 如果暂停了就不更新逻辑
        if (!this.player1 || !this.player2) return;

        // 更新玩家1
        this.player1.update(this.cursors, this.keys.attack, this.keys.block);

        // 简单的玩家2 AI (呆呆的)
        this.player2.setVelocityX(0);
        this.player2.play('idle', true);

        // --- 攻击判定检测 ---
        if (this.player1.isAttacking) {
            const hitbox = this.player1.getAttackHitbox();
            const enemyBody = this.player2.body;

            // 使用 Phaser 几何库检测重叠
            if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemyBody)) {
                
                // 防止一帧内多次判定 (简易冷却逻辑)
                if (!this.player2.hasBeenHit) {
                    this.player2.takeDamage(this.player1.attackDamage);
                    this.player2.setAlpha(0.5); // 受伤闪烁效果
                    this.player2.hasBeenHit = true;

                    // 200ms 后重置受伤状态
                    this.time.delayedCall(200, () => {
                        this.player2.clearAlpha();
                        this.player2.hasBeenHit = false;
                    });
                }
            }
        }
    }

    pauseGame() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeGame() {
        this.physics.resume();
        this.scene.resume();
    }

    restartGame() {
        this.scene.restart(); // 重启当前场景
    }
}