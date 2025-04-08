
# Exploring JavaScript Symbols


Deep dive into JavaScript Symbols - what they are, why they matter, and how to use them effectively
I remember the first time I encountered Symbols in JavaScript. It was 2015, and like many developers, I thought, “Great, another primitive type to worry about.”

But as I’ve grown in my career, I’ve come to appreciate these quirky little primitives. They solve some interesting problems in ways that strings and numbers just can’t match.

Symbols stand apart from other JavaScript primitives because they’re guaranteed to be unique.

When you create a Symbol with Symbol('description'), you’re getting something that will never equal any other Symbol, even one created with the same description. This uniqueness is what makes them powerful for specific use cases.




# JavaScript Symbols 探索

深入 JavaScript Symbols - 什么是 Symbols, 它们有什么用，以及如何更好的使用它们

我记得我第一次在 JavaScript 上遇到 Symbols 是在 2015 年， 和大多开发者一样，我想，“太棒了， 又 TM 要多操心一个基元数据类型了。”

但随着我工龄的增长，我已经感激这些有点小小怪异的基元类型了。它们用于来解决一些 不太适合用字符类似（string）和数字类型(number)来解决的一些问题。

Symbols 不同于其它的 JavaScript 基元类型， Symbols 保证每个都是唯一的。

当你使用 Symbol 创建一个 Symbol('description')， 你将会得到一个与其它 Symbol 完全不相等的对象， 甚至不同于用同样  Symbol('description') 创建的对象。

由于这样的特性，它们被用于一些特殊的场景。


```
const symbol1 = Symbol('description');
const symbol2 = Symbol('description');

console.log(symbol1 === symbol2); // false
```


The real power of Symbols emerges when working with objects. Unlike strings or numbers, Symbols can be used as property keys without any risk of colliding with existing properties. This makes them invaluable for adding functionality to objects without interfering with existing code.


When you use a Symbol as a property key, it won’t show up in Object.keys() or normal



Symbols 真正的强大之处在于当它与对象 (objects) 一起工作时。

与 string 和 number 类型不同，Symbols 可用作对象的属性而不用担心与任何已存在的属性相冲突。

这让它在为某个对象添加功能方法而不会干扰现有代码时极为有用。

```
const metadata = Symbol('elementMetadata');

function attachMetadata(element, data) {
  element[metadata] = data;
  return element;
}

const div = document.createElement('div');
const divWithMetadata = attachMetadata(div, { lastUpdated: Date.now() });
console.log(divWithMetadata[metadata]); // { lastUpdated: 1684244400000 }
```

当使用 Symbol 作为 key 属性时，它不会显示在 Object.key() 或普通的 for...in 循环内


```
const nameKey = Symbol('name');
const person = {
  [nameKey]: 'Alex',
  city: 'London'
};

// Regular enumeration won't show Symbol properties
// 普通枚举不会显示 Symbol 类型的属性
console.log(Object.keys(person));     // ['city']
console.log(Object.entries(person));  // [['city', 'London']]

for (let key in person) {
  console.log(key);                   // Only logs: 'city'
}

// But we can still access Symbol properties
// 但仍可以被访问到
console.log(Object.getOwnPropertySymbols(person));  // [Symbol(name)]
console.log(person[nameKey]);         // 'Alex'
```


You can still access these properties through Object.getOwnPropertySymbols(), but it requires intentional effort. This creates a natural separation between an object’s public interface and its internal state.

The global Symbol registry adds another dimension to Symbol usage. While normal Symbols are always unique, sometimes you need to share Symbols across different parts of code. That’s where Symbol.for() comes in:

你仍可以通过 `Object.getOwnPropertySymbols()` 方法访问到这些属性，但这需要是有意为之。

Symbol 这样的特性，在 object 对象的公开方法，属性和内部状态之间创建了一个天然的屏障。

全局的 Symbol 又为 Symbol 的使用场景添加了一个维度。普通的 Symbol 对象都是唯一的，但有时候你却想要在不同代码中共享 Symbol.

这就是 `Symbol.for()` 为何被推出：

```
// Using Symbol.for() for shared Symbols across modules
// 使用  Symbol.for() 在不同模块间共享
const PRIORITY_LEVEL = Symbol.for('priority');
const PROCESS_MESSAGE = Symbol.for('processMessage');

function createMessage(content, priority = 1) {
  const message = {
    content,
    [PRIORITY_LEVEL]: priority,
    [PROCESS_MESSAGE]() {
      return `Processing: ${this.content} (Priority: ${this[PRIORITY_LEVEL]})`;
    }
  };

  return message;
}

function processMessage(message) {
  if (message[PROCESS_MESSAGE]) {
    return message[PROCESS_MESSAGE]();
  }
  throw new Error('Invalid message format');
}

// Usage
const msg = createMessage('Hello World', 2);
console.log(processMessage(msg)); // "Processing: Hello World (Priority: 2)"

// Symbols from registry are shared
console.log(Symbol.for('processMessage') === PROCESS_MESSAGE); // true

// But regular Symbols are not
console.log(Symbol('processMessage') === Symbol('processMessage')); // false
```

>> [] 允许我们在 object 对象字面量上使用 Symbol 作为属性的 key


>> The brackets [] in the object literal allow us to use a Symbol as the property key.

JavaScript provides built-in Symbols that let you modify how objects behave in different situations. These are called well-known Symbols, and they give us hooks into core language features.

One common use case is making objects iterable with Symbol.iterator. This lets us use for...of loops with our own objects, just like we do with arrays:


JavaScript 提供了内建的 Symbols , 在对象处于不同状况下允许我们修改其行为表现。 

这些被叫作众所周知的 Symbol, 它们给了我们在核心语言特性上添加 hooks 的能力。

一个普遍的例子就是用 `Symbol.iterator` 为一个对象添加可迭代能力。 这让我们可以使用  `for...of` 像循环数组一样循环我们的对象 object ：

```
// Making an object iterable with Symbol.iterator
// 用 Symbol.iterator 建一个可被迭代的对象
const tasks = {
  items: ['write code', 'review PR', 'fix bugs'],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.items.length) {
          return { value: this.items[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// Now we can use for...of
for (let task of tasks) {
  console.log(task); // 'write code', 'review PR', 'fix bugs'
}
```

Another powerful well-known Symbol is Symbol.toPrimitive. It lets us control how objects convert to primitive values like numbers or strings. This becomes useful when objects need to work with different types of operations:


另一个广为人知的强大功能是 Symbol.toPrimitive。 它允许我们控制 object 对象如何转换成基元值，如数字或字符串。 

当对象需要根据不是类型进行不同运算时会变的非常有用：

```
const user = {
  name: 'Alex',
  score: 42,
  [Symbol.toPrimitive](hint) {
    // JavaScript tells us what type it wants with the 'hint' parameter
    // hint can be: 'number', 'string', or 'default'
    // JavaScript 用 hint 告诉我们它需要什么样的类型
    // hint 可能是 'number', 'string', or 'default'
    switch (hint) {
      case 'number':
        return this.score;    // When JavaScript needs a number (like +user)

      case 'string':
        return this.name;     // When JavaScript needs a string (like `${user}`)

      default:
        return `${this.name} (${this.score})`; // For other operations (like user + '')
    }
  }
};

// Examples of how JavaScript uses these conversions:
console.log(+user);        // + operator wants a number, gets 42
console.log(`${user}`);    // Template literal wants a string, gets "Alex"
console.log(user + '');    // + with string uses default, gets "Alex (42)"
```
>> Symbol.toPrimitive lets us control how our object converts to different types. JavaScript tells us what type it wants through the ‘hint’ parameter.

>> Symbol.toPrimitive 允许我们控制对象如何根据不同类进行型转。 JavaScript 通过 'hint' 参数 告诉我们它想要什么类型的数据

>> 译者注： 说实话这样用操作符对一个对象运算还真没用过，挺诡异


## Inheritance Control with Symbol.species
When working with arrays in JavaScript, we sometimes need to restrict what kind of values they can hold. This is where specialized arrays come in, but they can cause unexpected behavior with methods like map() and filter()

A normal JavaScript array that can hold any type of value:

An array that has special rules or behaviors - like only accepting certain types of values:

## 使用 Symbol.species 进行继承控制

当在 JavaScript 内使用 Array 数组时，我们有时候想要限制数组元素的类型。

这就是特殊数组的由来，但当它们与 `map()` 和 `filter()` 工作时会产生意外的行为


普通的数组可以接受任意类型的数组元素

```
// Regular array - accepts anything
const regularArray = [1, "hello", true];
regularArray.push(42);       // ✅ Works
regularArray.push("world");  // ✅ Works
regularArray.push({});       // ✅ Works
```

一个特殊规则或行为的数组 -- 比如只接收确定类型值：

```
// Specialized array - only accepts numbers
const createNumberArray = (...numbers) => {
  const array = [...numbers];

  // Make push only accept numbers
  array.push = function(item) {
    if (typeof item !== 'number') {
      throw new Error('Only numbers allowed');
    }
    return Array.prototype.push.call(this, item);
  };

  return array;
};

const numberArray = createNumberArray(1, 2, 3);
numberArray.push(4);     // ✅ Works
numberArray.push("5");   // ❌ Error: Only numbers allowed
```

Think of it like this: a regular array is like an open box that accepts anything, while a specialized array is like a coin slot that only accepts specific items (in this case, numbers).

The problem Symbol.species solves is: when you use methods like map() on a specialized array, do you want the result to be specialized too, or just a regular array?


想象一下，一个普通数组就像一个打开的盒子，可以放任意的东西，

然而一个特殊数组则像一个硬币插槽只接受特殊的东西(在这个例子中，只接受数字类型)。

Symbol.species 解决的是：当你在特殊数组上使用 `map()` 时，你想要的返回的结果依然是特殊类型数组还是普通数组？

```
// specialized array that only accepts numbers
// 只接受数组元素是 number 类型
class NumberArray extends Array {
  push(...items) {
    items.forEach(item => {
      if (typeof item !== 'number') {
        throw new Error('Only numbers allowed');
      }
    });
    return super.push(...items);
  }

  // Other array methods could be similarly restricted
  // 其它方法也可以按此方式实现数组元素约束
}

// Test our NumberArray
const nums = new NumberArray(1, 2, 3);
nums.push(4);     // Works ✅
nums.push('5');   // Error! ❌ "Only numbers allowed"

// When we map this array, the restrictions carry over because
// the result is also a NumberArray instance

// 当使用 map 返回一个新数组时，它依然是一个有约束能力的数组 NumberArray
const doubled = nums.map(x => x * 2);
doubled.push('6'); // Error! ❌ Still restricted to numbers

console.log(doubled instanceof NumberArray); // true
```


We can fix this by telling JavaScript to use regular arrays for derived operations. Here’s how Symbol.species solves this:

我们可以通过告诉 JavaScript 我们需要的是一个普通常规数组来解决这个问题。 下面是利用 Symbol.species 解决些问题的方法：

```
class NumberArray extends Array {
  push(...items) {
    items.forEach(item => {
      if (typeof item !== 'number') {
        throw new Error('Only numbers allowed');
      }
    });
    return super.push(...items);
  }

  // Tell JavaScript to use regular Array for operations like map()
  // 告诉 JavaScript 当使用 map() 等操作时返回常规数组
  static get [Symbol.species]() {
    return Array;
  }
}

const nums = new NumberArray(1, 2, 3);
nums.push(4);     // Works ✅
nums.push('5');   // Error! ❌ (as expected for nums)

const doubled = nums.map(x => x * 2);
doubled.push('6'); // Works! ✅ (doubled is a regular array)

console.log(doubled instanceof NumberArray); // false
console.log(doubled instanceof Array);       // true
```

>> Symbol.species fixes unexpected inheritance of restrictions. The original array stays specialized, but derived arrays (from map, filter, etc.) become regular arrays.

>> Symbol.species 修复了额外的继承类型约束。 原 NumberArray 数组不影响，但通过 map() 派生出来的数组则为常规数组

>> 注意 Symbol.species 特性正在被讨论是否移除出标准


Symbols Limitations and Gotchas
Working with Symbols isn’t always straightforward. One common confusion arises when trying to work with JSON. Symbol properties completely disappear during JSON serialization:

## Symbols 的限制与问题

与 Symbols 打交道可不是一帆风顺的。 与 JSON 一起使用时会有一个普遍的问题。

在 JSON  数列化时，Symbol 的特性会完全被展示出来：

```
const API_KEY = Symbol('apiKey');

// Use that Symbol as a property key
const userData = {
 [API_KEY]: 'abc123xyz',      // Hidden API key using our Symbol
 username: 'alex'             // Normal property anyone can see
};

// Later, we can access the API key using our saved Symbol
// 可以使用保存好的 Symbol  key 来访问到 apikey 值
console.log(userData[API_KEY]); // prints: 'abc123xyz'

// But when we save to JSON, it still disappears
// 但当被 JSON 序列化后，它会消失
const savedData = JSON.stringify(userData);
console.log(savedData);         // Only shows: {"username":"alex"}
```













https://www.trevorlasn.com/blog/symbols-in-javascript