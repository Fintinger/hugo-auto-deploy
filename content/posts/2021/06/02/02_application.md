---
title: 图的应用
date: 2021-06-04
categories:
 - 后端
tags:
 - 数据结构
 - 最小生成树
 - Prim
 - Kruskal
 - 最短路径
 - Dijkstra
 - Floyd
 - 拓扑排序
 - 关键路径
image: https://picsum.photos/seed/graphapply/640/360
---

## 一、最小生成树

##### 📌什么是生成树？

连通图的生成树是包含图中所有顶点的一个**极小连通子图**，通俗地讲，就是“边尽可能少，但需保持连通”。</br>

**规律：** 对于一个顶点数|V|=n的树，其生成树的边数|E|=n-1。如果将|E|+1，必然会形成回路；如果将|E|-1，则会成为非连通图。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529111129.png)

##### 📌什么是最小生成树？

> 最小生成树，也称最小代价树(Minimum Spanning Tree，MST)

是**带权连通无向图**的生成树中边的权值之和最小的一棵树，联系实际问题不难理解其中“最小代价”的意味。</br>

Prim（普利姆算法），Kruskal（克鲁斯卡尔算法）就是寻找最小生成树的常用算法。

### 1.Prim（普利姆算法）

> 从某一顶点开始，每次将<u>代价最小的新顶点</u>纳入生成树，直至所有顶点都纳入为止。

#### 图示

![截图_20210529120539](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529120555.gif)

易知，此方法得到的最小生成子树是<u>不唯一</u>的。

#### 代码实现

```cpp
void MiniSpanTree_PRIMI(Graph G,int u){
    //从顶点u出发找G的最小生成树
    for (int i = 0; i <G.vexnum; ++i) {//辅助数组初始化
        if(i!=u){
            closedge[i]={u,G.arcs[u][i]};
        }        
    }
    closedge[u].lowcost=0;
    for (int j = 0; j < G.vexnum; j++) {
        k=minimum(closedge);//求生成树的下一个节点
        cout<<cloedge[k].adjvex<<G.vex[k];
        closedge[k].lowcost=0;
        for (int i = 0; i < G.vexnum; i++) {
            if (G.arc[k][j].adj<closedge[j].lowcost) {
                closedge[j]={G.vexs[k],G.arcs[k][j].adj};
            }
        }
    }
}
```

### 2.Kruskal（克鲁斯卡尔算法）

> 每次选择一条权值最小的边，使这条边的两头连通（原本已经连通的就不选），直到所有结点都连通。

#### 图示

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210529120145.gif)

#### 代码实现

```cpp
void Kruskal(Graph G){
    //定义保存一条边的权值的数组，任意两个顶点之间的边权值都可能被保存进去
    int SortVal[G.arcnum][G.arcnum];
    for (int i = 0; i < G.vexnum; i++) 
        for (int j = 0; j < G.vexnum; j++) 
            if (Adjacent(G,G.Vex[i],G.Vex[j])) {//如果存在边|弧
                SortVal[i][j]=Get_edge_value(G,G.Vex[i],G.Vex[j]);//获取权值并保存
            }
    // Paixu(SortVal);
}
```

### 时间复杂度

| 算法 | 时间复杂度        | 适用方向 |
| ---- | ----------------- | -------- |
| P    | O(V^2)        | 边稠密图 |
| K    | $O(E\log_2 E)$ | 边稀疏图 |

## 二、最短路径

| 最短路径问题 | 算法                                        |
| ------------ | ------------------------------------------- |
| 单源路径问题 | BFS (无权图)<br /> Dijkstra(带权图、无权图) |
| 各点间路径   | Floyd(带权图、无权图)                       |

### 1.BFS

> 之所以叫BFS，是因为该方法求最短路径是在图的广度优先遍历算法(BFS)的基础上，求得了最短路径。

#### 代码实现

```cpp
//求顶点u到其他顶点的最短路径
void BFS_MIN_Distance(Graph G,int u){
    bool visited[MAX_VERTEX_NUM];
    SqQueue Q;//辅助队列
    
    int d[G.vexnum];//d[i]表示从u到i的最短路径
    int path[G.vexnum];//path[i]表示最短路径从哪个结点出来（前驱）
    for (int i = 0; i < G.vexnum; ++i) {//初始化
        d[i]=INIFINITY;
        path[i]=-1;
    }
    d[u]=0;
    visited[u]=true;
    EnQueue(Q,u);
    while(!isEmpty(Q)){
        DeQueue(Q,u);
        for (w=FirstNeighbor(G,u);w>=0;w=NextNeighbor(G,u,w))
            if (!visited[w]) {
                // visit(w);
                d[w]=d[u]+1;
                path[w]=u;
                visited[w]=true;
                EnQueue(Q,w);
            }//if
    }//while
}
```

<span style="color: #e01;">🧐实际上就是对DFS算法中`visit`这个没有具体实现的方法的修改操作,在 visit一个顶点时，修改其最短路径长度`d[]`并在`path[]`记录前驱结点。要注意出现的三个数组的意义:`d[] path[] visited[]`</span>

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530093531.png)


<span style="background:#fff066;">如图，是从2出发得到的数组，则2→8的最短路径长度d[8]=3，路径为8←7←6←2</span>

### 2.Dijkstra（迪杰斯特拉算法）

#### 图示

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602085522.gif)

#### 使用

对于最后得到的结果：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530103735.png)
<span style="background:#fff066;">例如求 V0到V2的最短路径，查表知，最短路径长dist[2]=9,其路径为 V2←V1←V4←V0</span>



#### 复杂度

时间复杂度为$O(|V|^2)$

#### 代码实现

> 代码实现上有点类似Prim算法

```cpp
//从V0出发，总共需要n-1轮处理
//每一轮处理：循环遍历所有个结点，找到 lowCost最低的，且还没加入树的顶点。
//再次循环遍历，更新还没加入的各个顶点的 lowCost值
bool fina[G.vexnum];//是否已经找到最短路径
int dist[G.vexnum];//最短路径长度
int path[G.vexnum];//路径上的前驱
```

#### 一点不足

Dijkstra(迪杰斯特拉算法)无法处理**存在负权值的图**，这点Floyd算法可以。

### 3.Floyd（弗洛伊德算法）

#### 算法思想（动态规划）

Floyd算法:求出每一对顶点之间的最短路径<br/>
使用动态规划思想，将问题的求解分为多个阶段<br/>
对于n个顶点的图G，求任意一对顶点Vi → Vj之间的最短路径可分为如下几个阶段:<br/>
#️⃣:不允许在其他顶点中转，最短路径是?<br/>
0️⃣:若允许在V0中转，最短路径是?<br/>
1️⃣:若允许在V0、V1 中转，最短路径是?<br/>
2️⃣:若允许在V0、V1、 V2中转，最短路径是?<br/>

⏩. . .<br/>

⏹:若允许在V0、V1、V2 .... Vn-1中转，最短路径是?<br/>

#### 实例演示

对于一个有向带权图：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530110302.png)

#️⃣初始条件下，即不允许在其他顶点中转，有：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530110459.png)

0️⃣:若允许在V0中转，计算得知，A和path更新为：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530110720.png)

1️⃣:若允许在V0、V1 中转，经计算，A和path更新为：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530110935.png)

2️⃣:若允许在V0、V1、 V2中转，经计算，A和path更新为：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530111036.png)

即，从$A^{(-1)},path^{(-1)}$出发，经过**n**轮递推，得到$A^{(n-1)},path^{(n-1)}$ <br/>

根据$A^{(2)}$可知，$V_0$到$V_2$最短路径长度为10，根据$path^{(2)}$可知，完整路径信息为$V_0→V_2→V_0$

#### 代码实现

核心更新代码如下：

```cpp
//...准备工作，初始化矩阵A和path
    for (int k = 0; k < n; k++) {//考虑以Vk作为中转点
        for (int i = 0; i < n; i++) {//遍历矩阵，i为行，j为列
            for (int j = 0; j < n; j++) {
                if (A[i][j]>A[i][k]+A[k][j]) { //以Vk为中转点的路径是否更短
                    A[i][j]=A[i][k]+A[k][j];//更新最短路径长度
                    path[i][j]=k;//修改中转点
                }//if
            }
        }
    }
```

#### 复杂度

时间复杂度：$O(|V|^3)$

空间复杂度：$O(|V|^2)$

#### 一点不足

对于有回路的带负权图（负权回图），会陷入死循环……

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530113103.png)

因为这种图本身可能就无解，即无最短路径，循环次数越多，路径越短。

### 4.总结

|                | BFS算法                    | Dijkstra算法           | Floyd算法                    |
| -------------- | -------------------------- | ---------------------- | ---------------------------- |
| 无权图         | ✔                          | ✔                      | ✔                            |
| 带权图         | ❌                          | ✔                      | ✔                            |
| 带负权值的图   | ❌                          | ❌                      | ✔                            |
| 带负权回路的图 | ❌                          | ❌                      | ❌                            |
| 时间复杂度     | $O(V^2)$或$O(V+E)$ | $O(V^2)$             | $O(V^3)$                   |
| 通常用于       | 求无权图的单源最短路径     | 求带权图的单源最短路径 | 求带权图中各顶点间的最短路径 |

## 三、有向无环图相关

📌什么是有向无环图？<br/>

若一个有向图中不存在环，则称为有向无环图，简称<u>DAG图</u>（Directed Acyclic Graph）

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210530113653.png)

### 1.描述表达式

> 对于给定的一个表达式，可通过有向无环图将其表示出来。

#### 示例

👉$((a+b)*(b*(c+d))+(c+d)*e)*((c+d)*e)$<br/>

1️⃣将各个操作数<u>不重复地</u>排成一排，之后把所有的运算符按照执行的先后顺序排序

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601074458.png)

2️⃣分层（上层运算必须依赖下层结果）按顺序加入运算符

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601074630.png)

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601074731.png)

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601074854.png)



最终：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601074957.png)

4️⃣自下而上逐层检查各层运算符之间是否可以合并

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601075441.png)

最终结果就是：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601075533.png)

#### 真题

29.【2019统考真题】用有向无环图描述表达式$(x+y)(x+y)/x)$，需要的顶点个数至少是(    )。<br/>
A.5    B.6     C.8     D.9 <br/>

答案：A

  ![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601075733.png)

### 2.拓扑排序

> 什么是拓扑排序？[拓扑排序 - 中文维基百科](https://www.so.wiiaa.top/zh-cn/拓撲排序) [拓扑排序_百度百科](https://baike.baidu.com/item/拓扑排序/5223807?fr=aladdin)

可见拓扑排序针对的是有向无环图，对于特殊的有向无环图——顶点活动网(Activity On Vertex network)，简称**AOV**网。整个AOV网通常表示一项具体的工程，其中**顶点表示活动，用弧表示活动之间的优先关系**。例如：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601080920.png)

#### 算法描述

对于一个给定的AOV网，通过以下几个步骤即可找到拓扑排序的序列：<br/>

1️⃣从AOV中选择没有前驱（入度为0）的顶点输出；<br/>

2️⃣ 删除与输出顶点相关的边；<br/>

3️⃣ 重复1️⃣2️⃣直至AOV网为空；<br/>

#### 代码实现

```cpp
bool TopologicalSort(Graph G){
    InitStack(S);//初始化栈，存储顶点的入度
    for (int i = 0; i < G.vexnum; i++) {
        if (indegree[i]==0) {
            Push(S,i);//入度为0的顶点入栈
        }
    }
    int count=0;//记录已经输出的顶点数
    while(!isEmpty(S)){
        Pop(S,i);
        print[count++]=i;//输出顶点i，并计数
        for (p=G.vextices[i].firstarc;p;p=p->nextarc) {
            //将所有i指向的顶点入度减1，并且将入度减为0的顶点入栈scanf
            v=p->adjvex;
            if (!(--indegree[v])) {
                Push(S,v);//入度为0，入栈
            }
        }//for
    }//while
    if (count<G.vexnum) {
        return false;//排序失败，有向图中有回路
    }else{
        return true; //成功
    }
}
```

**注意**💬<br />

🔸其中用到了两个数组：`indegree[]` 表示当前顶点的入度；`print[]` 用于记录拓扑序列；<br />

🔸代码中的图用邻接表的形式保存；<br />

🔸还引入辅助栈`S`，用于保存入度为0的结点；<br />

🔸最后还加入一步判断，用之前定义的`int count` ，记录输出的顶点数。如果`count < G.vexnum` ，提前退出`while`循环，原因是图中存在回路，导致栈在某时刻为空，因为拓扑排序针对无环图，所以拓扑排序失败！<br />

#### 时间复杂度

每个顶点要处理一次，每条边也要处理一次，因此时间复杂度为$O(E+V)$，如果采用邻接矩阵则需要 $O(V^2)$。



#### 逆拓扑排序

对一个AOV网，如果采用下列步骤进行排序，则称之为逆拓扑排序：<br />

①从AOV网中选择一个没有后继（出度为0）的顶点并输出。<br />

②从网中删除该顶点和所有以它为终点的有向边。<br />

③重复①和②直到当前的AOV网为空。<br />

##### 参照拓扑排序实现

```cpp
//abababa
```

##### DFS算法实现

```cpp
//如果图中存在回路，应该怎么判断？？
void DFSTraverse(Graph G){
    for (int i = 0; i < G.vexnum; ++i)
        visited[i]=false;
    for (int v = 0; v < G.vexnum; ++v)
        if (!visited[v])
            DFS(G,v);
}

bool TopologicalSort_DFS(Graph G,int v){
    visit(v);
    visited[v]=true;
    for (w=FirstNeighbor(G,v);w>=0;w=FirstNeighbor(G,v))//处理v的所有邻接点
        if (!visited[w]) {
            TopologicalSort_DFS(G,w);
        }
    print(v);//输出顶点    
}
```

#### 特性

💨拓扑，逆拓扑排序序列可能不唯一。<br />

💨如果存在回路，则没有拓扑，逆拓扑排序序列。<br />

### 3.关键路径

> 什么是关键路径？[关键路径_百度百科](https://baike.baidu.com/item/关键路径)

用顶点表示事件，弧表示活动，弧上的权值表示活动持续的时间的有向图叫**AOE**（Activity On Edge Network）网。<br />

#### 几个术语

**开始顶点（源点）**<br />

**结束顶点（汇点）**<br />

**关键路径**  从源点到汇点的延时最长的路径<br />

**关键活动**  关键路径上的所有活动。

**事件&活动**<br />

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601094739.png)

图中$V_k$表示事件，$a_i$表示活动。

| 事件$v_k$的最早发生时间$ve(k)$ | 决定了所有从开始的活动能够开工的最早时间                 |
| ------------------------------ | -------------------------------------------------------- |
| 活动$a_i$的最早开始时间$e(i)$  | 该活动弧的起点所表示的事件的最早发生时间                 |
| 事件$v_k$的最迟发生时间$vl(k)$ | 在不推迟整个工程完成的前提下，该事件最迟必须发生的时间   |
| 活动$a_i$的最迟开始时间$l(i)$  | 该活动弧的终点所表示事件的最迟发时间与该活动所需时间之差 |

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210601095725.png)

#### 求关键路径的步骤

对图中有向无环图求关键路径：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602073730.png)

##### 1️⃣求所有<u>事件</u>的最早发生时间ve(k) 

按<span style="color:#e01;">拓扑排序</span>序列，依次求各个顶点的$ve(k)$: <br />

$ve(源点) = 0$ <br />

$ve(k) = Max\left \{ve(j) + Weight(vj, vk)\right \}$, vj为vk 的任意前驱 <br />

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602073832.png)

##### 2️⃣求所有<u>事件</u>的最迟发生时间vl(k)

按<span style="color:#e01;">逆拓扑排序</span>序列，依次求各个顶点的 $vl(k)$: <br />

$vl(汇点) = ve(汇点)$ <br />

$vl(k) = Min\left \{vl(j) - Weight(vk, vj)\right \}$ , vj为vk的任意后继<br />

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602074903.png)

##### 3️⃣求所有<u>活动</u>的最早发生时间e(k)

若边$<vk,vj>$表⽰活动$ai$，则有$e(k) = ve(k)$<br/>

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602075220.png)

(ai对应于图中已标注的弧，但图中的数值表示该弧的权值)

##### 4️⃣求所有<u>活动</u>的最迟发生时间l(k)

若边$<vk,vj>$表⽰活动$ai$，则有$l(i) = vl(j) - Weight(vk, vj)$

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602080013.png)

##### 5️⃣求所有<u>活动</u>的时间余量d(k)

$d(k)=l(k)-e(k)$

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210602080216.png)

此时，<span style="color:#e01;">时间余量为0的活动就是关键活动，由关键活动组成关键路径</span> <br/>

即，<span style="background:#fff066">关键活动：a2, a5, a7   =>  关键路径：V1→V3→V4→V6</span>

#### 关键路径特点

🌚 若关键活动耗时增加，则整个⼯程的⼯期将增⻓ <br />

🌚 缩短关键活动的时间，可以缩短整个⼯程的⼯期 <br />

🌚 当缩短到⼀定程度时，关键活动可能会变成⾮关键活动 <br />

🌚 可能有多条关键路径，只提高一条关键路径上的关键活动速度并不能缩短整个工程的工期，只有加快那些包括在所有关键路径上的关键活动才能达到缩短工期的目的 <br />

#### 代码实现

```cpp
//adada
```

<span style="color:#888;margin-top:50px;">说明：文中图片来自王道考研辅导机构。</span>



