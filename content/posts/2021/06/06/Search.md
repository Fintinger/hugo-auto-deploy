---
title: 查找算法相关
date: 2021-06-06
categories:
 - 后端
tags:
 - 数据结构
 - 顺序查找
 - 折半查找
 - B树
 - 散列查找
image: https://picsum.photos/seed/Serach/640/360
---

## 顺序查找

```cpp
typedef struct{//查找表的数据结构（顺序表）
    int *elem;//动态数组基址
    int TableLen;//查找表长度
}SSTable;

int Seq_Search(SSTable ST,int key){
    ST.elem[0]=key;
    int i;
    for (i = ST.TableLen;ST.elem[i]!=key ; i--) {}//从后往前查找，最终返回下标i
    return i;//返回0说明没找到
}
```

### 效率分析

对于长度为n的顺序表，如果<u>查找成功</u>
$$
ASL={\frac{1+2+...+n}{n}}=\frac{n+1}{2}
$$
若果查找失败，则 $ASL=n+1$

总体上，该算法时间复杂度为 $O(n)$

### 优化思路

1.<span style="background-color:#fff006">如果使得表中的元素有序存放……</span>，可以构造出一棵查找判定树

<img src="https://gitee.com/fintinger/figure-bed/raw/master//images/20210602101845.png" style="zoom:33%;" />

此时，查找失败时$ASL=\frac{1+2+...+n+n}{n+1}=\frac{n}{2}+\frac{n}{n+1}$

**优点：** <span style="color:#e01">容易查找失败时ASL更小</span>

2.<span style="background-color:#fff006">如果各元素被查找的概率不同……</span>，可以把概率大的靠前

**优点：** <span style="color:#e01">容易查找成功时ASL更小</span>

## 折半查找

> 折半查找，又称“二分查找”，仅适用于**有序的顺序表**。

 <span style="color:#e01">针对升序排列的顺序表</span>，代码实现如下

```cpp
typedef struct{//查找表的数据结构（顺序表）
    int *elem;//动态数组基址
    int TableLen;//查找表长度
}SSTable;

int BinarySearch(SSTable L,int key){
    int low=0,high=L.TableLen-1,mid;
    while (low<=high) {
        mid=(low+high)/2;
        if (L.elem[mid]==key)
            return key;
        else if(L.elem[mid]>key)//从前半部分继续查找
            high=mid-1;
        else//从后半部分继续查找
            low=mid+1;
    }
    return -1;
}
```

### 折半查找判定树

对于一个给定的有序顺序表，

若其中元素个数为奇数个，则折半后构造出的判定树满足数量关系“左子树=右子树”；

若元素个数为偶数个，则根据$mid=\left \lfloor \frac{low+high}{2} \right \rfloor$,即<span style="color:#e01;">mid向下取整</span>，此时有”左子树=右子树-1“

故，不考虑失败结点，折半查找二叉树中满足 <span style="background-color:#fff006;">右子树结点数-左子树结点数=0或1</span>，因此对于**编号**为1~16的元素，不考虑失败结点，构造其折半查找判定树应该为：

<img src="https://gitee.com/fintinger/figure-bed/raw/master//images/20210602111935.png" style="zoom:30%;" />

**特征：**

① 折半查找判定树一定是平衡二叉树(AVL)；

②判定树结点的关键字满足 左<中<右，因此满足二叉排序树(BST)；

③ 失败结点有n+1个（等于成功结点的空链域数量）

### 效率分析

由于折半查找判定树的树高不超过$\left \lceil \log_2(n+1) \right \rceil$，因此

查找失败|成功的情况下，$ASL \leq n$

其时间复杂度为$O(\log_2n)$

## 分块查找

> 分块查找最大的特征就是“块内无序，块间有序”。

```cpp
//定义分块的索引表
typedef struct{
    int maxValue;//块中最大值
    int low,high;//块在顺序表中的起始和结束地址
}Index;
//顺序表存储实际元素
int List[100];
```

### 算法思想

对于给定的一串元素，整体上可能是无序的，但是如果按照最大有序序列划分之后，各块内就变得有序了。这样我们就可以根据分好的块建立的索引来快速定位key所在的区间。

<img src="https://gitee.com/fintinger/figure-bed/raw/master//images/20210603104602.png" style="zoom:50%;" />

分块查找，又称索引顺序查找，算法过程如下：

①在索引表中确定待查记录所属的分块（可顺序、可折半）

💥<span style="background-color:#fff006">注意在索引表中折半查找时，如果key没有直接等于maxValue，那么根据二分查找算法，当low>high时，需要在low指向的块内继续进行查找</span>

②在块内顺序查找

### 查找效率分析

只考虑特殊情况，假设<span style="color:#e01">长度为n的表被均匀地分成b块，每块s个元素</span>>，那么：

<img src="https://gitee.com/fintinger/figure-bed/raw/master//images/20210603110155.png" style="zoom: 80%;" />

设索引表和块内的平均查找长度分别为$L_I,L_S$，则整个查找过程的平均查找长度
$$
ASL=L_I+L_S
$$
具体地，如果<u>对索引表</u>采用<span style="background:#fff006">顺序查找</span>的方式：

$L_I={\frac{1+2+...+b}{b}}=\frac{b+1}{2}$

$L_S={\frac{1+2+...+s}{s}}=\frac{s+1}{2}$

则$ASL=\frac{s^2+2s+n}{2s}$，当$s=\sqrt{n}$ 时，$ASL_{min}=\sqrt{n}+1$

如果采用<span style="background:#fff006">折半查找</span>的方式：

$ASL=\left \lceil \log_2(b+1) \right \rceil+\frac{s+1}{2}$

### 优化思路

如果插入某个元素，顺序表方式复杂度太高，故可采用链式存储的方式存储数据元素。 

## B树

> B树，又称多路平衡查找树，B树中所有结点的孩子个数的最大值称为B树的阶，通常用m表示。

对于一个<span style="color:#e01">m阶B树</span>其核心特征如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210603115805.png)

### B树高度

> 对于B树的高度，一般<span style="color:#e01;">不包括叶结点（失败的结点）</span>

#### 最小高度

为使得<u>有n个关键字的m阶B树</u>有最小高度，那么<u>每个结点应该尽可能地满</u>，有m-1个关键字，m个分叉，则有 

$n\leq(m-1)(1+m+m^2+...+m^{h-1})=m^h-1$  可以得到，<span style="border:3px dashed #e01;padding:3px;">$h\geq \log_m(n+1)$</span>

#### 最大高度

方式一：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210603115918.png)

方式二：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210603115945.png)

### 插入删除操作

<p style="border:3px dashed #e01;padding:2px;display:table;padding:5px 10px;">核心要求：</br>    ①对m阶B树除根节点外，结点关键字个数 m/2 -1 ≤ n ≤ m-1</n></br>
②子树0<关键字1<子树1<关键字2<子树2<...</p>


#### 插入操作

新元素一定是插入到最底层“终端节点”，用“查找”来确定插入位置

在插入key后，若导致**原结点关键字数超过上限**，则从**中间位置（m/2上取整）**将其中的关键字**分为两部分**，左部分包含的关键字放在原结点中，右部分包含的关键字放到新结点中，中间位置（m/2）的结点插入原结点的父结点。

若此时导致**其父结点的关键字个数也超过了上限**，则**继续**进行这种分裂操作，直至这个过程传到根结点为止，进而导致**B树高度增1**。

下图分别演示两种关键字超出结点上限的情况

![普通结点溢出](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605154812.gif)

![根节点溢出](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605154837.gif)

#### 删除操作

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605155708.png)

### B+树

> 有类似分块查找，上层保存下层结点中的最大值，但又保存了B树的一些特性

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605160212.png)

一棵<span style="color:#e01">m阶B+树</span>满足以下条件：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605160450.png)

#### 查找

<span style="color:#e01">B+树中，无论查找成功与否，最终一定要走到最下面一层结点。</span>

可以从根节点出发逐层查找，也可以借助指针p进行顺序查找 

#### 对比B树

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605161703.png)

## 散列查找

> 散列表(Hash Table)，又称哈希表。是一种数据结构，特点是：数据元素的关键字与其存储地址直接相关。

### 相关概念

**同义词：** 若不同的关键字通过散列函数映射到同一个值，则称它们为“同义词”

**冲突：** 通过散列函数确定的位置已经存放了其他元素，则称这种情况为“冲突”

**哈希函数：** 关键字与存放地址之间的转换函数。

**查找长度： **在查找运算中，需要对比关键字的次数称为查找长度。可能为0。

**装填因子：**对一个有n个关键字形成的长度为l的散列表，其装填因子 $\alpha=\frac{n}{l}$，表示的是查找失败时的平均查找长度ASL（当查找长度可为0的时）。装填因子越大说明散列表越满。

### 处理冲突的方法

#### 1.拉链法(链接法或链地址法) 

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605170355.png)

#### 2.开放定址法

所谓开放定址法，是指可存放新表项的空闲地址既向它的**同义词表项开放**，又向它的**非同义词表开放**。其数学递推公式为：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605171135.png)

其中，*i=0,1,2,...,k(k ≤ m-1)*，m表示<span style="color:#e01">散列表长</span>；$d_i$为<span style="color:#e01">增量序列</span>；i可理解为“第i次发生冲突”

对于增量序列$d_i$，有三种方法确定：①线性探测法；②平方探测法；③伪随机序列法

##### ①线性探测法

<span style="background:#dedede;padding:5px">$d_i$=0,1,2,3，...  ，m-1；即发生冲突时，每次往后探测相邻的<u>下一个单元是否为空</u></span>

例如，有一堆数据元素，关键字分别为{19,14,23,1,68,20,84,27,55,11,10,79}，散列函数H（key）=key%13，

在存放1时，由于 1%13=1，但位置1处已经存在14，因此会后移一位存放到$H_1$=(1+$d_1$)%16=2的位置:

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210605173556.png)

**查找**

对于一个给定的key，通过开放定址法给出的递推公式确定其位置，若冲突，则寻找下一个位置，直至找到或遇到空地址失败为止。值得注意的是，在计算平均查找长度时，<u>空位置的比较也记作一次</u>，此外<span style="background:#fff006">如果能够越早遇到空位置，就能越早确定查找失败。</span>

**删除**

删除操作不能简单地将某位置置为空（若置为空，将截断在它之后填⼊ 散列表的同义词结点的查找路径，可能导致查找操作误判），而应该<span style="background:#fff006">做⼀个“删除标记”，进⾏逻辑删除</span>。

**平均查找长度**

对于下图中的散列表{19,14,23,1,68,20,84,27,55,11,10,79}，散列函数H（key）=key%13

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606154801.png)

成功：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606154803.png)

失败：



![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606154809.png)

如果通过递推式映射到0的位置，只需1次对比

如果是1的位置，需要1,2,3...13，总共13次对比

如果是2的位置，需要2,3，... 13，总共12次对比

......

<span style="padding:5px;border:2px dashed #e01">线性探测法很容易造成同义词、⾮同义词的“聚集（堆积）”现象，严重影响查找效率</span>

##### ②平方探测法

<span style="background:#dedede;padding:5px">$d_i=0^2,1^2，-1^2,2^2，-2^2...k^2,-k^2$；称为平方探测法，又称二次探测法，其中k≤m/2.</span>

**注意：** 散列表⻓度m必须是⼀个可以表示成4j + 3的素数，才能探测到所有位置------《数论》



![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606154815.png)

如图，可见，当表长为8时，没有探测到整个表。

##### ③伪随机序列法

<span style="background:#dedede;padding:5px">di 是⼀个伪随机序列，如 di= 0, 5, 24, 11, …</span>

#### 3.再散列法(再哈希)

除了原始的散列函数 H(key) 之外，多准备⼏个散列函数， 当散列函数冲突时，⽤下⼀个散列函数计算⼀个新地址，直到不冲突为⽌。





### 常见的散列函数

> 目标：<u>让不同关键字的冲突尽可能地少</u>

#### 1.除留余数法

*H(key)= key % p*

散列表表长为m，取一个**不大于m但最接近或等于m的质数p**，分布更均匀，冲突更少。参见《数论》

#### 2.  直接定址法

*H(key) = key 或 H(key) = a × key + b*

其中，a和b是常数。这种方法计算最简单且不会产生冲突。它适合**关键字的分布基本连续的情况**，若关键字分布不连续，空位较多，则会造成存储空间的浪费。

例如：学生学号的保存

#### 3.数字分析法

*选取数码分布较为均匀的若干位作为散列地址*

设关键字是r进制数（如十进制数），而**r个数码在各位上出现的频率不一定相同，可能在某些位上分布均匀一些**，每种数码出现的机会均等；而在某些位上分布不均匀，只有某几种数码经常出现，此时可选取数码分布较为均匀的若干位作为散列地址。这种方法**适合于已知的关键字集合，若更换了关键字，则需要重新构造新的散列函数**。

例如：对手机号码，可以设计后四位作为散列地址

#### 4.平方取中法

*取关键字的平方值的中间几位作为散列地址。*

具体取多少位要视实际情况而定。这种方法得到的散列地址与关键字的每位都有关系，因此使得散列地址分布比较均匀，适用于**关键字的每位取值都不够均匀或均小于散列地址所需的位数。**

例：要存储整个学校的学生信息，以“身份证号”作为关键字设计散列函数

> 散列查找是“空间换时间”的算法，在散列表设计合理的情况下，散列表越长，冲突概率越低。

