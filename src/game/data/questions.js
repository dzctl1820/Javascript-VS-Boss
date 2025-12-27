export const QUESTIONS = [
    {
        id: 1,
        question: "typeof null 的结果是?",
        options: ["'null'", "'object'", "'undefined'", "'number'"],
        correctIndex: 1
    },
    {
        id: 2,
        question: "以下哪个不是 JavaScript 的基本数据类型?",
        options: ["Symbol", "BigInt", "Float", "Undefined"],
        correctIndex: 2
    },
    {
        id: 3,
        question: "如何声明一个块级作用域变量?",
        options: ["var", "let", "global", "scope"],
        correctIndex: 1
    },
    {
        id: 4,
        question: "Promise.all() 的返回值是?",
        options: ["Promise", "Array", "Object", "Error"],
        correctIndex: 0
    },
    {
        id: 5,
        question: "NaN === NaN 的结果是?",
        options: ["true", "false", "undefined", "error"],
        correctIndex: 1
    },
    {
        id: 6,
        question: "[] == ![] 的结果是?",
        options: ["true", "false", "undefined", "error"],
        correctIndex: 0
    },
    {
        id: 7,
        question: "以下哪个方法可以向数组末尾添加元素?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctIndex: 0
    },
    {
        id: 8,
        question: "const a = {}; const b = a; b.name = 'js'; console.log(a.name) 输出什么?",
        options: ["undefined", "'js'", "null", "error"],
        correctIndex: 1
    },
    {
        id: 9,
        question: "以下哪个关键字用于定义异步函数?",
        options: ["await", "async", "promise", "defer"],
        correctIndex: 1
    },
    {
        id: 10,
        question: "JSON.parse() 的作用是?",
        options: ["将对象转换为JSON字符串", "将JSON字符串转换为对象", "解析XML", "加密数据"],
        correctIndex: 1
    },
    {
        id: 11,
        question: "Event Loop 中的微任务(Microtask)包括?",
        options: ["setTimeout", "setInterval", "Promise.then", "setImmediate"],
        correctIndex: 2
    },
    {
        id: 12,
        question: "0.1 + 0.2 === 0.3 的结果是?",
        options: ["true", "false", "undefined", "NaN"],
        correctIndex: 1
    },
    {
        id: 13,
        question: "Function.prototype.bind() 返回什么?",
        options: ["执行结果", "undefined", "一个新的函数", "原函数"],
        correctIndex: 2
    },
    {
        id: 14,
        question: "Symbol() === Symbol() 的结果是?",
        options: ["true", "false", "error", "undefined"],
        correctIndex: 1
    },
    {
        id: 15,
        question: "以下哪个不是 ES6 新增的特性?",
        options: ["Arrow Function", "Class", "Prototype", "Destructuring"],
        correctIndex: 2
    },
    {
        id: 16,
        question: "Set 数据结构的特点是?",
        options: ["键值对", "有序", "值唯一", "先进先出"],
        correctIndex: 2
    },
    {
        id: 17,
        question: "WeakMap 的键必须是?",
        options: ["字符串", "数字", "对象", "任何类型"],
        correctIndex: 2
    },
    {
        id: 18,
        question: "如何阻止事件冒泡?",
        options: ["preventDefault()", "stopPropagation()", "stopImmediatePropagation()", "cancelBubble()"],
        correctIndex: 1
    },
    {
        id: 19,
        question: "console.log(typeof NaN) 输出什么?",
        options: ["'NaN'", "'undefined'", "'number'", "'object'"],
        correctIndex: 2
    },
    {
        id: 20,
        question: "Array.prototype.map() 的返回值类型是?",
        options: ["Array", "Boolean", "Number", "Void"],
        correctIndex: 0
    },
    {
        id: 21,
        question: "以下哪个操作符用于求幂运算?",
        options: ["^", "**", "pow", "&&"],
        correctIndex: 1
    },
    {
        id: 22,
        question: "Object.keys() 返回什么?",
        options: ["值的数组", "键的数组", "键值对数组", "对象"],
        correctIndex: 1
    },
    {
        id: 23,
        question: "如何检查一个属性是否存在于对象及其原型链中?",
        options: ["hasOwnProperty", "in 操作符", "exists", "contains"],
        correctIndex: 1
    },
    {
        id: 24,
        question: "(() => {}) instanceof Function 的结果是?",
        options: ["true", "false", "error", "undefined"],
        correctIndex: 0
    },
    {
        id: 25,
        question: "let a = 1; { let a = 2; } console.log(a) 输出?",
        options: ["1", "2", "undefined", "error"],
        correctIndex: 0
    }
];
