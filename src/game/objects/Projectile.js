// src/game/objects/Projectile.js
import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bow');
        
        // 将精灵添加到场景和物理系统中
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 设置物理属性
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.body.allowGravity = false; // 不受重力影响
        
        // 设置大小
        this.setSize(30, 20);
        
        // 初始化为非活动状态
        this.setActive(false);
        this.setVisible(false);
    }
    
    init(direction) {
        // 设置速度
        const speed = 400;
        this.setVelocityX(direction * speed);
        
        // 根据方向翻转图片
        if (direction < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
        
        // 添加旋转效果
        this.setAngularVelocity(direction * 300);
        
        // 生命周期计时器，避免太多对象存在
        this.lifespan = 3000; // 3秒后自动销毁
        this.scene.time.delayedCall(this.lifespan, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
    
    destroy() {
        super.destroy();
    }
}