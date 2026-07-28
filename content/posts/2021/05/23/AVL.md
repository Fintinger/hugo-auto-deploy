---
title: AVL树
date: 2021-05-23
categories:
 - 后端
tags:
 - 数据结构 
 - AVL
image: https://picsum.photos/seed/AVLTREE/640/360
---

> 平衡二叉树是Adelson-Velsky和 Landis发明，故命名为AVL树。也称平衡二叉查找树。

✨**特点：** ①左子树<根<右子树； ②任一节点，左右子树高度之差不超过1.

## 平衡因子

$平衡因子=左子树高-右子树高$

## AVL树的插入操作

AVL树插入新结点导致不平衡之后，只需将**最小不平衡子树**平衡，其他祖先结点会随之恢复平衡。

### 调整最小不平衡子树

<p style="background:#ffa502;">注意：调整过后必须保证其BST的特性，即“左子树<根<右子树”</p>

#### 1.LL

> 即在以A为根节点的树的**左孩子B的左子树上**插入新结点，导致A成为最小不平衡子树。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523093652.png)

调整过程如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523094719.png)

#### 2.RR

> 即在以A为根节点的树的**右孩子B的右子树上**插入新结点，导致A成为最小不平衡子树。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523095839.png)

调整过程如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523100041.png)

#### 3.LR

> 即在以A为根节点的树的**左孩子B的右子树上**插入新结点，导致A成为最小不平衡子树。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523101352.png)

观察得知，所进行的调整就是保证$|平衡因子|<=1$，因此若插入操作使得

左 - 右 > 1 => 右旋

 右 - 左 > 1  =>左旋

 而当进行了LR插入操作之后，导致以A为根节点的树 **左-右>1**，理应右旋但是，由上述结果可知，经过右旋之后：

 ![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523105119.png)

可以看到，为了保证其左子树<根<右子树的特性，经过调整后，依然存在右-左>1的问题；

因此，对于LR型不能简单进行右旋调整，应该先将其**转化为LL型** (左旋)，再进行右旋；

为此，我们需要将BR结点展开，之后旋转成为LL型插入

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523110018.png)

可以看到，展开后又出现两种插入情况CL&CR，但其实两者处理大同小异：

CR插入调整过程如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523110155.png)

#### 4.RL

> 即在以A为根节点的树的**右孩子B的左子树上**插入新结点，导致A成为最小不平衡子树。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523110426.png)

参考LR型，其调整过程如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210523110538.png)

## 查找操作效率分析

Assuming that, $n_h$表示深度为h的平衡树中含有的最少结点，则

$n_0=0$,$n_1=1$,$n_2=2$...存在递归关系 $n_h=n_{h-1}+n_{h-2}+1$,即左右子树结点之和+根节点。

可以证明(AVL证明)，n个结点的平衡二叉树最大深度数量级为$\log_2n$，则其查找操作的复杂度为$O(\log_2n)$



