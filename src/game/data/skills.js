export const SKILLS = {
    scopeStrike: {
        id: 'scopeStrike',
        name: 'Scope Strike',
        description: '发射一道作用域光波',
        cost: 10,
        cooldown: 1000,
        icon: '⚡',
        type: 'damage',
        damage: 15,
        color: 0x00ff00
    },
    promiseShield: {
        id: 'promiseShield',
        name: 'Promise Shield',
        description: '创建一个承诺护盾，抵挡下一次攻击',
        cost: 20,
        cooldown: 5000,
        icon: '🛡️',
        type: 'buff',
        duration: 3000,
        color: 0x0000ff
    },
    asyncFreeze: {
        id: 'asyncFreeze',
        name: 'Async/Await',
        description: '让敌人进入 await 状态，无法移动',
        cost: 30,
        cooldown: 8000,
        icon: '❄️',
        type: 'debuff',
        duration: 2000,
        color: 0x00ffff
    },
    thisBinding: {
        id: 'thisBinding',
        name: 'this.flash()',
        description: '改变 this 指向，瞬间移动一段距离',
        cost: 15,
        cooldown: 3000,
        icon: '👻',
        type: 'utility',
        distance: 200,
        color: 0xffff00
    },
    garbageCollection: {
        id: 'garbageCollection',
        name: 'Garbage Collection',
        description: '终极技能：回答正确触发随机特效技能',
        cost: 50,
        cooldown: 15000,
        icon: '♻️',
        type: 'ultimate',
        damage: 50,
        requiresQuiz: true,
        color: 0xff00ff
    }
};

export const ULTIMATE_VARIANTS = [
    {
        id: 'stackOverflow',
        name: 'Stack Overflow 栈溢出',
        description: '数据爆炸！对敌人造成巨额范围伤害',
        damage: 60,
        color: 0xff4500 // OrangeRed
    },
    {
        id: 'closureTrap',
        name: 'Closure Trap 闭包陷阱',
        description: '将敌人困在闭包中，持续造成伤害',
        damage: 10, // per tick
        duration: 3000,
        color: 0x800080 // Purple
    },
    {
        id: 'prototypeChain',
        name: 'Prototype Chain 原型鞭挞',
        description: '召唤原型链条抽打敌人',
        damage: 45,
        color: 0xffff00 // Yellow
    },
    {
        id: 'eventLoopTornado',
        name: 'Event Loop 循环风暴',
        description: '将敌人卷入无限循环，造成眩晕和伤害',
        damage: 30,
        duration: 2000, // stun duration
        color: 0x00ced1 // DarkTurquoise
    },
    {
        id: 'strictModeJudgement',
        name: 'Strict Mode 严格审判',
        description: '来自严格模式的天罚，无视防御',
        damage: 70,
        color: 0xdc143c // Crimson
    }
];
