---
title: 图的存储
date: 2021-06-02
categories:
 - 后端
tags:
 - 数据结构
 - 邻接矩阵
 - 邻接表
 - 十字链表
 - 邻接多重表
image: https://picsum.photos/seed/graphstroage/640/360
math: true
---

## 邻接矩阵

> Vextex/Vertices 顶点; Martix 矩阵; Arc 弧.

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526095923.png)

### 代码实现

```cpp
#define MaxVextexNum 100//容许存储的最大顶点数

typedef struct{
    char Vex[MaxVextexNum];
    //可以将定点之间的关系用int 类型01表示，也可定义为boolean/枚举类型，占空间更小
    bool Edge[MaxVextexNum][MaxVextexNum];
    int vexnum,arcnum;//顶点数和弧|边数
}MGraph;
```

即![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526102019.png)



### 找度

**根据邻接矩阵计算结点的度TD**

|           | 无向图                         | 有向图                                                       |
| --------- | ------------------------------ | ------------------------------------------------------------ |
| $TD(V_i)$ | 第i行（或i列）中非零元素的个数 | $ID(V_i)$ : i行非零元素个数<br />$OD(V_i)$: i列非零元素个数<br />TD=ID+OD |

### 对于带权图（网）

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526104343.png)

```cpp
#define MaxVextexNum 100//容许存储的最大顶点数
#define INIFINITY //宏定义，表示无穷

typedef char VextexType;//顶点
typedef int EdgeType;//权值

typedef struct{
    VextexType Vex[MaxVextexNum];
    EdgeType Edge[MaxVextexNum][MaxVextexNum];
    int vexnum,arcnum;
}MGraph;
```

### 复杂度

空间复杂度来自数组`Vex[]`跟`Edge[]`，故空间复杂度为$|V|+|V|^2=O(|V|^2)$，即为顶点数量的二次方，故此方法更**适合存储稠密图**，不然有较多浪费。

### 性质

1. 设图G的邻接矩阵为A（矩阵元素为0/1），则<span style="background:#ffa502;">$A^n$的元素$A^n[i][j]$等于由顶点$i$到顶点$j$的长度为$n$的路径的数目。</span>

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526105313.png)

对于$A^2[1][4]=a_{1,1}a_{1,4}+a_{1,2}a_{2,4}+a_{1,3}a_{3,4}+a_{4,1}a_{4,4}=1$，</br>
<span style="background:#ffa502;">$a_{1,2}a_{2,4}=1*1$表示，有一条从$Vex[1]→Vex[2]→Vex[4]$的线，总结果$A^2[1][4]=1$表示从A到D路径长为2的路径数目为1，也就是$A→B→$D.</span>


2. 对给定的图G，其邻接矩阵是唯一的。

## 邻接表

> adjacency list 邻接表;

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526110617.png)

### 代码实现

```cpp
#define MaxVextexNum 100
typedef char VextexType;//顶点

//"边|弧"
typedef struct ArcNode{
    int adjvex;//边|弧指向哪一节点,"相邻的结点"
    typedef struct ArcNode *next;//指向下一条弧的指针
    //Infotype info; //边权值
}ArcNode;//定义边结点

//"顶点"
typedef struct VNode{
    VextexType data;//数据域
    ArcNode *first;//第一条边|弧
}VNode,AdjList[MaxVextexNum];//定义顶点结点，AdjList为VNode类型的数组

//"邻接表"
typedef struct{
    AdjList vertices;//定义一个邻接链表
    int vexnum,arcnum;//节点数，边|弧数
}ALGraph;
```

### 复杂度

| 无向图        | 有向图                  |
| ------------- | ----------------------- |
| $O(V+2E)$ | $O(V+E)$ [只记出度] |

**适合稀疏图**。

### 找度

| 入度                          | 出度                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| 结点$i$的`*first`+`*next`数量 | 遍历所有节点，找到指向当前节点的所有指针数，之和即为出度（较复杂） |

### 性质

1. 邻接表的表示方式不唯一。
2. 找有向图的入边不太方便。

## 十字链表（有向图）

> 十字链表只用于存储有向图

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526155808.png)

### 复杂度

**空间复杂度：**  $O(|V|+|E|)$，存储了所有顶点和边

### 找度

| 入度               | 出度               |
| ------------------ | ------------------ |
| 顺着橙色🍍找，直至^ | 顺着绿色🥒找，直至^ |

拿找A结点的出度为例</br>

从A绿色🥒出发，箭头指向01，即找到A→B的路径</br>

继续从绿色🥒出发，箭头指向02，即找到A→C的路径</br>

02绿色🥒处为^即再无出度

## 邻接多重表（无向图）

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526161505.png)

### 复杂度

**空间复杂度：** $O(|V|+|E|)$

### 找度

从A出发，第一条边为01即AB这条边</br>

顺着iLink（即橙色）找到下一条边为01，即AD这条边</br>

至此，橙色为^即，无与0（即A）直接相连的边！</br>

其他类似

## 横向对比

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210526165434.png)

🤩后续研究一般只针对**邻接矩阵**和**邻接表**进行