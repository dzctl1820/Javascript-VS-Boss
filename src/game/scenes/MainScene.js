// src/game/scenes/MainScene.js
import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Projectile } from '../objects/Projectile';
import eventBus from '../utils/eventBus';
import { SKILLS, ULTIMATE_VARIANTS } from '../data/skills';

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
        // 加载远程攻击素材
        this.load.image('bow', 'assets/bow.png');
    }

    create() {
        try {
            // 0. 生成粒子纹理 (程序化生成，无需额外图片)
            if (!this.textures.exists('particle_circle')) {
                const pGraphics = this.make.graphics({ x: 0, y: 0, add: false });
                pGraphics.fillStyle(0xffffff, 1);
                pGraphics.fillCircle(4, 4, 4);
                pGraphics.generateTexture('particle_circle', 8, 8);
                pGraphics.destroy(); // 销毁 Graphics 对象释放资源
            }
            
            if (!this.textures.exists('particle_star')) {
                const pGraphics = this.make.graphics({ x: 0, y: 0, add: false });
                pGraphics.fillStyle(0xffffff, 1);
                // 画一个简单的菱形/星星
                pGraphics.beginPath();
                pGraphics.moveTo(5, 0);
                pGraphics.lineTo(10, 5);
                pGraphics.lineTo(5, 10);
                pGraphics.lineTo(0, 5);
                pGraphics.closePath();
                pGraphics.fillPath();
                pGraphics.generateTexture('particle_star', 10, 10);
                pGraphics.destroy();
            }
        } catch (e) {
            console.error('Failed to generate textures:', e);
        }

        // 1. 创建背景
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background')
            .setOrigin(0.5)
            .setDisplaySize(width, height);

        // 2. 创建地面 (不可见物理体)
        const ground = this.add.rectangle(width / 2, height - 50, width, 40, 0x000000, 0);
        ground.name = 'ground'; // 添加名称以便在resize事件中找到它
        this.physics.add.existing(ground, true); // true = 静态物体

        // 3. 创建玩家 1 - 使用相对位置
        this.player1 = new Player(this, width * 0.2, height - 200);
        this.player1.setTint(0xff0000); // 染红以区分

        // 4. 创建玩家 2 (AI) - 使用相对位置
        this.player2 = new Player(this, width * 0.8, height - 100, true);
        this.player2.setFlipX(true);
        this.player2.setTint(0x0000ff); // 染蓝
        
        // 调试信息：检查player2是否有takeDamage方法
        console.log('Player2 has takeDamage method:', typeof this.player2.takeDamage);
        
        // 5. 设置碰撞
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.player1, this.player2);
        
        // 创建远程攻击物数组
        this.projectiles = this.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });
        
        // 设置远程攻击与玩家的碰撞
        this.physics.add.overlap(this.projectiles, this.player2, this.hitEnemy, null, this);

        // 6. 输入按键绑定 (左手WASD移动，右手小键盘攻击/技能)
        // 解决 "按键乱了" 的问题：分离双手操作区域
        
        // 移动：WASD
        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.keys = this.input.keyboard.addKeys({
            attack: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
            block: Phaser.Input.Keyboard.KeyCodes.NUMPAD_DECIMAL,
            jump: Phaser.Input.Keyboard.KeyCodes.W, // W 也可以跳跃
            skill1: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
            skill2: Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
            skill3: Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
            skill4: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
            skill5: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE
        });
        
        // 添加调试信息
        console.log('Keys bound: WASD(Move), Num0(Attack), Num.(Block), Num1-4(Skills)');

        // 7. 监听 Vue 发来的事件
        eventBus.on('game-pause', () => this.pauseGame());
        eventBus.on('game-resume', () => this.resumeGame());
        eventBus.on('game-start', () => this.restartGame());
        
        // 8. 监听窗口大小变化
        this.scale.on('resize', this.handleResize, this);

        // 9. Knowledge Regeneration Timer
        this.time.addEvent({
            delay: 1000, // Every 1 second
            callback: () => {
                if (this.player1 && this.player1.active) {
                    this.player1.regenerateKnowledge();
                }
            },
            loop: true
        });
    }

    update() {
        // 如果暂停了就不更新逻辑
        if (!this.player1 || !this.player2) return;

        // 更新玩家1
        this.player1.update(this.cursors, this.keys.attack, this.keys.block, this.keys.jump);

        // 技能按键检测
        if (Phaser.Input.Keyboard.JustDown(this.keys.skill1)) {
            this.tryUseSkill('scopeStrike');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.skill2)) {
            this.tryUseSkill('promiseShield');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.skill3)) {
            this.tryUseSkill('asyncFreeze');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.skill4)) {
            this.tryUseSkill('garbageCollection');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.skill5)) {
            this.tryUseSkill('thisBinding');
        }

        // 简单的玩家2 AI (智能)
        if (this.player2 && this.player2.body) {
            if (!this.player2.isFrozen) {
                // 更新 AI 决策
                this.player2.updateAI(this.player1);
                // 应用决策
                this.player2.update();
            } else {
                 // 即使被冰冻，也应该调用 update 以保持状态（如重力），但禁止输入
                 // 这里简单处理：如果被冻结，velocity X设为0
                 this.player2.setVelocityX(0);
                 if (this.player2.body.onFloor()) this.player2.play('idle', true);
            }
        }

        // --- 攻击判定检测 (Player 1 Attack Player 2) ---
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

        // --- 攻击判定检测 (Player 2 Attack Player 1) ---
        if (this.player2 && this.player2.active && this.player2.isAttacking) {
            const hitbox = this.player2.getAttackHitbox();
            const playerBody = this.player1.body;

            if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, playerBody)) {
                 if (!this.player1.hasBeenHit) {
                    this.player1.takeDamage(this.player2.attackDamage);
                    this.player1.setAlpha(0.5);
                    this.player1.hasBeenHit = true;
                    this.time.delayedCall(200, () => {
                        this.player1.clearAlpha();
                        this.player1.hasBeenHit = false;
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
    
    handleResize(gameSize, baseSize, displaySize, resolution) {
        // 当窗口大小变化时，重新调整元素位置
        const { width, height } = gameSize;
        
        // 更新地面位置
        const ground = this.children.getByName('ground');
        if (ground) {
            ground.setPosition(width / 2, height - 50);
            ground.setSize(width, 40);
        }
        
        // 更新玩家位置（保持相对位置）
        if (this.player1) {
            this.player1.x = width * 0.2;
        }
        if (this.player2) {
            this.player2.x = width * 0.8;
        }
    }
    
    // 发射远程攻击
    fireProjectile(player) {
        // 保留此方法兼容旧逻辑，或作为 Scope Strike 的基础
        this.tryUseSkill('scopeStrike');
    }

    tryUseSkill(skillId) {
        const skill = SKILLS[skillId];
        if (!this.player1.canUseSkill(skillId)) return;
        
        if (skill.requiresQuiz) {
            eventBus.emit('trigger-quiz', (isCorrect) => {
                if (isCorrect) {
                    this.executeSkill(skillId);
                } else {
                    eventBus.emit('combat-log', '回答错误！技能释放失败！');
                    // 也可以扣除少量魔法作为惩罚
                }
            });
        } else {
            this.executeSkill(skillId);
        }
    }

    executeSkill(skillId) {
        if (this.player1.useSkill(skillId)) {
            const skill = SKILLS[skillId];
            switch (skillId) {
                case 'scopeStrike':
                    this.fireSkillProjectile(this.player1, skill);
                    break;
                case 'promiseShield':
                    this.activateShield(this.player1, skill);
                    break;
                case 'asyncFreeze':
                    this.freezeEnemy(this.player2, skill);
                    break;
                case 'garbageCollection':
                    this.executeUltimate(this.player2, skill);
                    break;
                case 'thisBinding':
                    this.performFlash(this.player1, skill);
                    break;
            }
        }
    }

    performFlash(player, skill) {
        const distance = skill.distance || 200;
        const direction = player.flipX ? -1 : 1;
        const newX = player.x + distance * direction;
        
        // 边界检查
        let finalX = Phaser.Math.Clamp(newX, 50, this.scale.width - 50);
        
        // 特效：原地留下残影
        const ghost = this.add.sprite(player.x, player.y, 'fighter');
        ghost.setFrame(player.frame.name);
        ghost.setFlipX(player.flipX);
        ghost.setAlpha(0.5);
        ghost.setTint(0xffff00);
        
        this.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 500,
            onComplete: () => ghost.destroy()
        });
        
        // 移动玩家
        player.x = finalX;
        
        // 出现特效
        const flash = this.add.circle(player.x, player.y, 30, 0xffff00, 0.8);
        this.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
        
        eventBus.emit('combat-log', '> this = new Position()');
    }

    executeUltimate(target, skill) {
        // 随机选择一个特效技能
        const variant = Phaser.Utils.Array.GetRandom(ULTIMATE_VARIANTS);
        eventBus.emit('combat-log', `触发终极技能：${variant.name}！`);
        
        switch (variant.id) {
            case 'stackOverflow':
                this.triggerStackOverflow(target, variant);
                break;
            case 'closureTrap':
                this.triggerClosureTrap(target, variant);
                break;
            case 'prototypeChain':
                this.triggerPrototypeChain(target, variant);
                break;
            case 'eventLoopTornado':
                this.triggerEventLoopTornado(target, variant);
                break;
            case 'strictModeJudgement':
                this.triggerStrictModeJudgement(target, variant);
                break;
        }
    }

    triggerStackOverflow(target, skill) {
        // 1. 粒子爆炸
        const particles = this.add.particles(target.x, target.y, 'particle_star', {
            speed: { min: 100, max: 400 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            tint: skill.color,
            quantity: 50,
            blendMode: 'ADD'
        });
        
        // 2. 冲击波 (圆形扩散)
        const shockwave = this.add.circle(target.x, target.y, 10, skill.color, 0.5);
        this.tweens.add({
            targets: shockwave,
            radius: 200,
            alpha: 0,
            duration: 500,
            onComplete: () => shockwave.destroy()
        });

        this.cameras.main.shake(300, 0.03);
        
        if (target && target.takeDamage) {
            target.takeDamage(skill.damage);
        }
        
        this.time.delayedCall(1000, () => particles.destroy());
    }

    triggerClosureTrap(target, skill) {
        // 1. 粒子牢笼 (旋转)
        const particles = this.add.particles(target.x, target.y, 'particle_circle', {
            speed: 0,
            scale: { start: 0.5, end: 0.2 },
            lifespan: 2000,
            tint: skill.color,
            blendMode: 'ADD',
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(-40, -60, 80, 120),
                quantity: 40
            }
        });

        // 让整个粒子系统旋转（模拟闭包作用域）
        // 注意：particles 容器本身不一定能旋转，我们可能需要旋转 shape 或者用 graphics
        // 这里用 Graphics 画一个旋转的框更简单
        
        const cage = this.add.graphics();
        cage.lineStyle(4, skill.color);
        cage.strokeRect(-40, -60, 80, 120);
        cage.x = target.x;
        cage.y = target.y;

        this.tweens.add({
            targets: cage,
            angle: 360,
            duration: 3000,
            repeat: -1
        });
        
        // 持续伤害
        let ticks = 0;
        const interval = this.time.addEvent({
            delay: 500,
            callback: () => {
                if (target && target.takeDamage) {
                    target.takeDamage(skill.damage);
                    target.setTint(skill.color);
                    this.createHitEffect(target.x + Phaser.Math.Between(-20, 20), target.y + Phaser.Math.Between(-40, 40), skill.color);
                    this.time.delayedCall(200, () => target.clearTint());
                }
                ticks++;
                if (ticks >= 6) { // 3 seconds
                    interval.remove();
                    cage.destroy();
                    particles.destroy();
                }
            },
            loop: true
        });
    }

    triggerPrototypeChain(target, skill) {
        // 闪电链条效果
        const graphics = this.add.graphics();
        const startX = this.player1.x;
        const startY = this.player1.y - 20;
        
        // 创建多次闪电重绘，制造不稳定感
        let flashCount = 0;
        const flashEvent = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                graphics.clear();
                graphics.lineStyle(Phaser.Math.Between(2, 5), skill.color, 1);
                
                let currentX = startX;
                let currentY = startY;
                const segments = 8;
                const dx = (target.x - startX) / segments;
                const dy = (target.y - startY) / segments;
                
                graphics.beginPath();
                graphics.moveTo(startX, startY);
                
                for (let i = 0; i < segments; i++) {
                    currentX += dx;
                    currentY += dy;
                    graphics.lineTo(currentX + Phaser.Math.Between(-30, 30), currentY + Phaser.Math.Between(-30, 30));
                }
                graphics.lineTo(target.x, target.y);
                graphics.strokePath();

                flashCount++;
                if (flashCount > 10) { // 持续 0.5s
                    flashEvent.remove();
                    graphics.destroy();
                    if (target && target.takeDamage) {
                        target.takeDamage(skill.damage);
                        this.createHitEffect(target.x, target.y, skill.color);
                    }
                }
            }
        });
    }

    triggerEventLoopTornado(target, skill) {
        // 龙卷风粒子
        const particles = this.add.particles(target.x, target.y, 'particle_star', {
            speed: { min: 50, max: 200 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            tint: skill.color,
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            quantity: 5,
            blendMode: 'ADD',
            gravityY: -200 // 向上飘
        });
        
        // 螺旋上升动画
        // Phaser 3 粒子可以用 emitter.startFollow 但很难做复杂的螺旋
        // 简单的做法是粒子本身有旋转，且 target 被冻结并旋转
        
        if (target && target.isFrozen !== undefined) {
             target.isFrozen = true;
             target.setTint(0x999999);
             
             // 旋转敌人
             this.tweens.add({
                 targets: target,
                 angle: 360 * 3,
                 duration: skill.duration,
                 ease: 'Linear'
             });

             if (target.takeDamage) {
                 target.takeDamage(skill.damage);
             }

             this.time.delayedCall(skill.duration, () => {
                 target.isFrozen = false;
                 target.clearTint();
                 target.angle = 0; // 复位
                 particles.destroy();
             });
        }
    }

    triggerStrictModeJudgement(target, skill) {
        // 巨型光柱从天而降 (激光炮)
        const graphics = this.add.graphics();
        
        // 1. 预警线
        graphics.lineStyle(2, skill.color, 0.5);
        graphics.strokeRect(target.x - 30, 0, 60, target.y + 50);
        
        this.time.delayedCall(500, () => {
            graphics.clear();
            // 2. 轰炸
            graphics.fillStyle(skill.color, 1);
            graphics.fillRect(target.x - 40, 0, 80, this.scale.height);
            
            this.cameras.main.flash(300, 255, 255, 255);
            this.cameras.main.shake(300, 0.05);
            
            // 粒子爆发
            this.createHitEffect(target.x, target.y, skill.color);
            this.createHitEffect(target.x, target.y - 50, skill.color);
            this.createHitEffect(target.x, target.y - 100, skill.color);
            
            if (target && target.takeDamage) {
                target.takeDamage(skill.damage);
            }
            
            this.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 800,
                onComplete: () => graphics.destroy()
            });
        });
    }

    fireSkillProjectile(player, skill) {
        const direction = player.flipX ? -1 : 1;
        const x = player.x + (direction * 40);
        const y = player.y - 20;
        
        const projectile = this.projectiles.get(x, y);
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.init(direction);
            projectile.setTint(skill.color);
            projectile.damage = skill.damage; // 设置自定义伤害

            // 添加拖尾特效
            const particles = this.add.particles(0, 0, 'particle_circle', {
                speed: 20,
                scale: { start: 0.6, end: 0 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 300,
                tint: skill.color,
                blendMode: 'ADD',
                frequency: 20
            });
            particles.startFollow(projectile);
            
            // 当 projectile 销毁时，销毁粒子发射器
            projectile.once('destroy', () => {
                particles.stop();
                // 给粒子一点时间消失
                this.time.delayedCall(500, () => particles.destroy());
            });
        }
    }

    activateShield(player, skill) {
        player.setTint(skill.color);
        player.isInvulnerable = true;
        eventBus.emit('combat-log', 'Promise Shield 已激活！');
        
        this.time.delayedCall(skill.duration, () => {
            player.clearTint();
            player.isInvulnerable = false;
            eventBus.emit('combat-log', 'Promise Shield 已失效。');
        });
    }

    freezeEnemy(enemy, skill) {
        if (!enemy || !enemy.body) return;
        
        enemy.setTint(skill.color);
        enemy.isFrozen = true;
        enemy.body.moves = false; // 禁止物理移动
        eventBus.emit('combat-log', '敌人进入 await 状态...');
        
        this.time.delayedCall(skill.duration, () => {
            enemy.clearTint();
            enemy.isFrozen = false;
            enemy.body.moves = true;
            eventBus.emit('combat-log', '敌人恢复执行。');
        });
    }


    
    // 处理远程攻击击中敌人
    hitEnemy(projectile, enemy) {
        // 确保第一个参数是projectile，第二个是enemy
        let actualProjectile = projectile;
        let actualEnemy = enemy;
        
        // 如果第一个参数不是Projectile，交换它们
        if (projectile.constructor.name !== 'Projectile') {
            actualProjectile = enemy;
            actualEnemy = projectile;
        }
        
        // 确保enemy有takeDamage方法
        if (typeof actualEnemy.takeDamage === 'function') {
            const damage = actualProjectile.damage || 10; // 默认10，或取技能伤害
            actualEnemy.takeDamage(damage); 
        } 
        
        // 视觉特效：击中粒子
        this.createHitEffect(actualEnemy.x, actualEnemy.y, actualProjectile.tintTopLeft || 0xffffff);

        // 销毁远程攻击物
        actualProjectile.destroy();
        
        // 添加击中效果（闪烁 + 震屏）
        this.cameras.main.shake(100, 0.005);
        
        if (actualEnemy.setAlpha) {
            actualEnemy.setAlpha(0.5);
            this.time.delayedCall(100, () => {
                if (actualEnemy.clearAlpha) {
                    actualEnemy.clearAlpha();
                }
            });
        }
    }

    createHitEffect(x, y, color) {
        const particles = this.add.particles(x, y, 'particle_star', {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            gravityY: 0,
            quantity: 10,
            tint: color,
            blendMode: 'ADD'
        });
        
        // 自动销毁
        this.time.delayedCall(300, () => particles.destroy());
    }
}