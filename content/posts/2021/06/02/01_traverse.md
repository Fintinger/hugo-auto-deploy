---
title: 图的遍历
date: 2021-06-03
categories:
 - 后端
tags:
 - 数据结构
 - BFS
 - DFS
image: https://picsum.photos/seed/graphtraverse/640/360
---

## 广度优先遍历（BFS）

> BFS(Breadth-First-Search)，参考对树的层序遍历

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529082956.png)

对上面的图从①出发进行BFS得到序列：

①②⑤ ⑥ ③⑦ ④⑧

若采用不同的储存结构，可能会得到不同的遍历结果（这个差异主要来自寻找邻接点的过程），对于**邻接矩阵存储的图，由于邻接矩阵是唯一的，所以BFS序列也是唯一的；同理，邻接表存储的图BFS序列不唯一**。

### BFS算法

> 与树的层序遍历不同的是，由于图中存在回路，遍历过程中会出现重复访问的问题，故可构造visited数组，用来标记已访问过的数组。<br/>
>
> 此外，还应针对非连通图做额外的判断，遍历完一个连通分量（极大连通子图）后，遍历查找visited数组中是否还存在未遍历的，如果有即为另一连通分量，继续调用BFS即可。

```cpp
void BFS(Graph G,int v);

bool visited[MAX_VERTEX_NUM];

SqQueue Q;//辅助队列
void BFSTraverse(Graph G){
    //初始化visited数组
    for (int i = 0; i < G.vexnum; ++i) {//使下标从1开始
        visited[i]=false;
    }
    //对非连通图的处理
    for (int v = 0; v < G.vexnum; ++v) {
        if (!visited[v])
            BFS(G,v);
    }
}

//从顶点v出发广度优先遍历图G
void BFS(Graph G,int v){
    visit(v);
    visited[v]=true;
    EnQueue(Q,v);//顶点v入队列Q
    while(!isEmpty(Q)){
        DeQueue(Q,v);//顶点v出队列Q
        for (w=FirstNeighbor(G,v);w>=0;w=NextNeighbor(G,v,w))//处理v的所有邻接点
            if (!visited[w]) {
                visit(w);
                visited[w]=true;
                EnQueue(Q,w);
            }//if
    }//while
}
```

需要借助辅助队列存储v的所有邻接结点

### 复杂度

#### （一）空间

空间复杂度主要来自辅助队列，在访问v的邻接结点时会入队，因此最坏的情况下

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529100353.png)

复杂度为：$O(|V|)$

#### （二）时间

对时间复杂度的分析，不必纠结于算法中的具体循环，只需宏观地分析：</br>

①访问|V|个结点需要的时间复杂度？</br>

②访问各个结点的邻接结点需要的时间？

|            | 邻接矩阵型 | 邻接表型        |
| ---------- | ---------- | --------------- |
| ①          | $O(V)$   | $O(V)$        |
| ②          | $O(V^2)$ | $O(2E)=O(E)$ |
| 时间复杂度 | $O(V^2)$ | $O(V+E)$    |

**时间复杂度=访问各结点所需时间+探索各条边所需时间**

### 广度优先生成树

> 简而言之，就是 $\text{连通图}\overset{BFS}{\rightarrow}\text{树}$

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529101642.png)

即 **仅保留每个节点<u>第一次被访问</u>的那条通路**

> 此外还有广度优先生产森林，即 $\text{非连通图}\overset{BFS}{\rightarrow}\text{森林}$

## 深度优先遍历（DFS）

> BFS(Depth-First-Search)，参考对树的先序遍历

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529102902.png)

对上面的图从②出发进行DFS得到序列：

② ① ⑤ ⑥ ③ ④⑦ ⑧ </br>

同样的，邻接矩阵存储得到序列唯一，邻接表则不唯一。

### DFS算法

```cpp
void DFS(Graph G,int v);

bool visited[MAX_VERTEX_NUM];
void DFSTraverse(Graph G){
    //初始化visited数组
    for (int i = 0; i < G.vexnum; ++i)
        visited[i]=false;
    //对非连通图的处理
    for (int v = 0; v < G.vexnum; ++v) 
        if (!visited[v])
            DFS(G,v);
}

//从顶点v出发广度优先遍历图G
void DFS(Graph G,int v){
    visit(v);
    visited[v]=true;
    for (w=FirstNeighbor(G,v);w>=0;w=FirstNeighbor(G,v))//始终遍历v的第一个邻接点，往“深”处走
        if (!visited[w]) {
            DFS(G,w);
        }//if
}
```

### 复杂度

#### （一）空间

主要来自**函数调用栈**，因此最坏的情况与最好的情况分别是

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529104525.png)

因此，空间复杂度为$O(|V|)$

#### （二）时间

|            | 邻接矩阵型 | 邻接表型     |
| ---------- | ---------- | ------------ |
| ①          | $O(V)$   | $O(V)$     |
| ②          | $O(V^2)$ | $O(E)$      |
| 时间复杂度 | $O(V^2)$ | $O(V+E)$ |

### 深度优先生成树

同BFS

## 思考：图的遍历与图的连通性

根据上述算法可知，对于无向图，调用BFS/DFS的次数与<u>连通分量</u>的数量有关，即 $\text{BFS|DFS调用次数}\propto \text{连通分量数}$ </br>

对于有向图：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529102405.png)

1.若从①出发，需要调用几次DFS?</br>

答：4次。</br>

2.若从⑦出发，需要调用几次DFS?</br>

答：1次。</br>

因此，有

| 图的分类 | 调用BFS\|DFS次数                                             |
| :------: | :----------------------------------------------------------- |
|  无向图  | 连通：1次<br />非连通：连通分量数                            |
|  有向图  | 普通有向图：具体分析（与出发点的选择有关）<br />强连通图：1次 |

🖋