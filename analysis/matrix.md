即对 Canvas  context 上下文基础坐标进行了变更

所以 append 时基础坐标轴发生了变幻，drawImage, 或 fillText 时，坐标可以使用相对坐标而不用累计递归父级坐标

变幻矩阵本身进行变化计算，Canvas context 上下文基础坐标不变

所以 prependMatrix 函数 用在父级 matrix 递归 prepend

```
localToGlobal = function(x, y, pt) {
    return this.getConcatenatedMatrix(this._props.matrix).transformPoint(x,y, pt||new createjs.Point());
};
```

```
globalToLocal = function(x, y, pt) {
    return this.getConcatenatedMatrix(this._props.matrix).invert().transformPoint(x,y, pt||new createjs.Point());
};
```

原来还是递归父级 matrix 通过 prependMatrix 方法合并 matrix

```
getConcatenatedMatrix = function(matrix) {
    var o = this, mtx = this.getMatrix(matrix);
    while (o = o.parent) {
        mtx.prependMatrix(o.getMatrix(o._props.matrix));
    }
    return mtx;
};
```
