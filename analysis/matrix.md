
Matrix append 与 prepend

append 定义： 右乘，是对原空间基向量进行变换，表现为坐标（对偶空间上的元素）不变，原空间基向量发生改变

即对 Canvas  context 上下文基础坐标进行了变更

所以 append 时基础坐标轴发生了变幻，drawImage, 或 fillText 时，坐标可以使用相对坐标而不用累计递归父级坐标

prepend 定义： 左乘，实际上是对坐标（或者说对偶空间上的元素）进行变换，表现为原空间基向量不变，变换本身发生了变换

变幻矩阵本身进行变化计算，Canvas context 上下文基础坐标不变

所以 prepend 用在父级 matrix 递归 prepend
