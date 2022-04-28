---
title: 由遍历序列构造出二叉树
date: 2021-05-09
categories:
 - 后端
tags:
 - 数据结构
---

## 由遍历序列构造出二叉树

仅知道**一种遍历序列是无法确定唯一的二叉树的**，以中序遍历为例，对于一个中序遍历序列“BDCAE”，其对应的树形结构可能有下面三种：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508160552.png)

因此，至少需要两种遍历序列才可以推知树形结构。

### 1.前序+中序遍历序列

**🎈基本步骤**  由前序遍历的特性得知，**前序遍历中第一个节点必然为根节点**，因此根据中序遍历特性，**根节点左边为左子树下的所有节点，右边为右子树下的所有节点**，然后分别在左子树序列右子树序列中重复进行即可。

**🎈示例** 

- 前序遍历序列：A D B C E
- 中序遍历序列：B D C A E

首先能确定根节点为A，根据中序遍历序列可以得到：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508162126.png)

对于左子树BDC，根据前序遍历，此子树根节点为D，根据中序遍历序列：

![image-20210508165242806](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508165242.png)

至此，二叉树的还原工作就完成了！至于更复杂的序列，逐步推断即可😋

### 2.后序+中序遍历序列

🔑与1不用的是，后序遍历中**根节点为后序遍历序列尾部的那个节点**，其余参照1即可！

### 3.层序遍历+中序遍历

🔑 根据层序遍历特性，层序遍历中根节点始终在子树前面，“根左右”

**🎈示例** 

- 层序遍历序列：A D E B C
- 中序遍历序列：B D C A E

根节点为A，根据中序遍历序列可以得到：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508162126.png)

对于左子树BDC，根据前序遍历，此子树根节点为D，根据中序遍历序列：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508165242.png)

### 思考

> 如果前序，后续，层序两两组合能否确定唯一的树结构？

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508165921.png)

假设给定序列如下：

- 前序：A B
- 后序：B A
- 层序：A B

其两两组合都满足两种结构：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210508170408.png)

因此**前序，后续，层序两两组合不能确定唯一的树结构**。

