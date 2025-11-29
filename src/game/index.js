// src/game/index.js
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

let game = null;

export const initPhaserGame = (parentId) => {
    // 销毁旧实例 (热重载保护)
    if (game) {
        game.destroy(true);
        game = null;
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: parentId, // 挂载点的 DOM 元素或 ID
        backgroundColor: '#2d2d2d',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // 重力在对象内部控制
                debug: false // 开启调试模式 (可以看到碰撞框)
            }
        },
        scene: [MainScene],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    game = new Phaser.Game(config);
    return game;
};

// 获取游戏实例
export const getGame = () => game;