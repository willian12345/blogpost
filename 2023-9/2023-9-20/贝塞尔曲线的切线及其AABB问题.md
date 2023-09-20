## 未能实现曲线的 AABB

这不是行业不景气业务下降了么..

互联网行业是肉眼可见的不景气

业务量也下降了，业务相关的工作也变的不再饱和

我的工作积极性降低了，啊..开始摆烂了

可以将时间花一部分在自己感兴趣的内容上了，想到哪里干到哪里

而最近在翻译文章时贝塞尔曲线又回顾了一下

这不是想起 2020 年遇到过的一个技术问题：曲线的 AABB

AABB 即图形界中常说的 AABB (axis-aligned bounding box) 包围盒, 严格来说是未能实现 BB

是时候解决一下了，有点儿朝花夕拾那意思了



## 2020 年的微信小程序

自己写的简单图形库曲线未能实现 AABB

那是在 2020 年上一家公司，公司安排我负责微信小程序的开发

其中经常要用微信小程序生成海报，保存在图片用于在手机上的传播

单独手工去拼接生成海报还是比较麻烦的， Canvas 提供的 api 相对比较低级，

当时看到一些人开源出来的类似 json 配置形式生成海报图

这种配置类型的实现原理是大多是通过配置的坐标，大小，颜色，以及一些简单的 CSS 样式解析后在 canvas 上绘制

相对于纯手工去画，确实进步了很多，但遇到复杂一点儿的海报绘制，还是会有一定的局限性

而小程序中又没办法使用 Pixi.js、EaseJs 这类 Canvas 的图形库

当时就抽空写了一个简易的 Canvas 操作库 DuduCanvas

DuduCanvas 基本封装实现了图片，文本，形状等相关对象的绘制

调用的方式相比于配置要稍低级一点，拥有更大的自由度，例如添加一个圆形的头像图片：

```
const avatar = new Image({
      image: loader.get('avatar'),
      width: 100, 
      height: 100,
})

// 将头像变成圆形
avatar.borderRadius = '100%'

// 添加一个文本
const t1 = new Text()
t1.text = '你好世界Hello'
t1.color = 'red'
t1.x = 100
t1.y = 300
// 添加到舞台
stage.addChild(img, t1)

```

至少对于当时的项目来讲，DuduCanvas 运行的还不错

但它有几个缺点：

1. 没有实现事件系统，当然它大部分时间只是用于生成海报，用不到事件交互

2. 绘制曲线图形后的 BB 未能实现，需要自己手动指定

3. 由于是 2020 年 当时微信小程序的 Canvas 2D 版本还牌测试版，所以使用的旧版 Canvas API

没过多久离职了，工作重心也从小程序转到其它前端项目


## 先从三阶贝塞尔曲线开始

之前在翻译 [贝塞尔曲线文字路径](https://www.cnblogs.com/willian/p/17706242.html) 一文中提到过三阶贝塞尔曲线

它由 4 个控制点：

```
(x1, y1), (x2, y2), (x3, y3), (x4,y4)
```

定义 A..H 系数

```
A = x3 - 3 * x2 + 3 * x1 - x0
B = 3 * x2 - 6 * x1 + 3 * x0
C = 3 * x1 - 3 * x0
D = x0

E = y3 - 3 * y2 + 3 * y1 - y0
F = 3 * y2 - 6 * y1 + 3 * y0
G = 3 * y1 - 3 * y0
H = y0
```

得到多项式：

```
x = At3 + Bt2 + Ct + D 
y = Et3 + Ft2 + Gt + H 
```

那么我们先用 Javascript 实现一下那篇文章中提到过的垂直于曲线的单位向量

假设我们要绘制的三阶贝塞尔曲线的四个控制点

```
[
      { x: 120, y: 320 },
      { x: 135, y: 440 },
      { x: 320, y: 280 },
      { x: 480, y: 340 },
];
```

下面是它三阶贝塞尔曲线采样点，t 取值 0-1 ：

```
// 用 t 获取“样条曲线” 采样点
let sx = A * Math.pow(t, 3) + B * Math.pow(t, 2) + C * t + D
let sy = E * Math.pow(t, 3) + F * Math.pow(t, 2) + G * t + H
```

sx, sy 就是 t 从 0 - 1 时算出的曲线上的每个点

如果 t 取值足够小，那么在 canvas 上画出所有的点它就是一条贝塞尔曲线

t 间隔为 0.1 时:

![image](./0.png)

t 间隔为 0.001 时:

![image](./1.png)

画出垂直于曲线的向量关键, 在于对三阶贝塞尔曲线多项式的求导

如果你忘记了什么是求导（导函数）, 没关系, 直接用公式就完了

我这个学渣都会用，你肯定也可以，

当然最好是回去复习一下高中后期的导函数部分，有助于理解曲线切线的几何意义

求导后得到向量：

```
// 求导前
x = At3 + Bt2 + Ct + D 
y = Et3 + Ft2 + Gt + H 

// 求导后
Vx = 3At2 + 2Bt + C 
Vy = 3Et2 + 2Ft + G 
```

用 Javascript 实现如下：

```
// (求导)用于计算曲线上采样点的切线向量
let tx = 3 * A * Math.pow(t, 2) + 2 * B * t + C
let ty = 3 * E * Math.pow(t, 2) + 2 * F * t + G

// 旋转 90 度或 270 度垂直于曲线采样点
let px = ty
let py = -tx

// 缩至单位向量
let magnitude = Math.sqrt(px * px + py * py)
px = px / magnitude
py = py / magnitude

// 为了向量可见，扩大 20 个单位
px *= 20;
py *= 20;

// 从采样点连接至切线向量偏移位置
console.log(sx + px, sy + py);
```

![image](./2.png)

源码：...



## 把三阶贝塞尔曲线包起来

要实现三阶贝塞尔曲线的AABB(包围合)还是得从切线入手















































在翻译 [贝塞尔曲线文字路径](https://www.cnblogs.com/willian/p/17706242.html) 一文中提到过垂直于切线的向量

文中是用 c# 伪代码形式讲解的作为一个 web 前端，还是得用 Javascript 来实践验证一下

You’ll need to know the function of the cubic bezier. Defined as:
f(t) = a*t^3 + b*t^2 + c*t +d
where
d = P0
c = 3*P1-3*P0
b = 3*P2-6*P1+3*P0
a = P3-3*P2+3*P1-P0

p0 and p3 are the begin and end point of the bezier, p1 & p2 the control points. This function is defined for t=[0..1] so (0, 0.00001, 0.00002, … 0.99999)






Most of this is addressed in An algorithm to find bounding box of closed bezier curves? except here we have cubic Beziers and there they were dealing with quadratic Bezier curves.

Essentially you need to take the derivatives of each of the coordinate functions. If the x-coord is given by

x = A (1-t)^3 +3 B t (1-t)^2 + 3 C t^2 (1-t) + D t^3

differentiating with respect to t.

dx/dt =  3 (B - A) (1-t)^2 + 6 (C - B) (1-t) t + 3 (D - C) t^2
      =  [3 (D - C) - 6 (C - B) + 3 (B - A)] t^2
       + [ -6 (B - A) - 6 (C - B)] t
       + 3 (B - A) 
      =  (3 D - 9 C + 9 B - 3 A) t^2 + (6 A - 12 B + 6 C) t + 3 (B - A)

this is a quadratic which we can write at a t^2 + b t + c. We want to solve dx/dt = 0 which you can do using the quadratic formula

- b +/- sqrt(b^2-4 a c)
-----------------------
        2 a

Solving this will either gives two solutions t0, t1 say, no solutions or in rare case just one solution. We are only interest in solutions with 0 <= t <= 1. You will have a maximum of four candidate points, the two end points and the two solutions. Its a simple matter to find which of these give the extreme points.

You can repeat the same process for each coordinate and then get the bounding box.

I've put this for the 2D case in a js fiddle http://jsfiddle.net/SalixAlba/QQnvm/4/
Share
Improve this answer
Follow
edited May 23, 2017 at 10:29
Community's user avatar
CommunityBot
111 silver badge
answered Jul 17, 2014 at 22:24
Salix alba's user avatar
Salix alba
7,53622 gold badges3232 silver badges3838 bronze badges

    Awesome, thanks! I noticed an instability, though, when a==0, it gives incorrect bounds, as t1 and t2 both turn out to be infinity. I fixed it with a hack that seems to work: if (a==0) a = 0.0000001; an example: jsfiddle.net/QQnvm/38 (actually a quadratic.) – 
    Jeff Ward
    Jan 12, 2017 at 15:40
    2
    That hack is kinda pointless, though. Rather than using hacks, you could just check the formula for how to handle that case. If a == 0, you can simply solve the equation b t + c = 0 which gives you t = -c / b. – 
    Stefan Fabian
    Dec 29, 2017 at 11:11

