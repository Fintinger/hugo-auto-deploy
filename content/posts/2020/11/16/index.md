---
title: 向量空间管理策略
date: 2020-11-16
categories:
 - 学习总结
tags:
 - 数据结构
image: https://picsum.photos/seed/kongjianguali/640/360
---

> 向量的空间管理，有静态和动态两种策略

## 静态空间管理策略

开辟内部数组`_elem[]`并使用一段地址连续的物理空间，`_capacity`表示总容量 ，`_size`表示当前的实际规模n，示意图如下：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20201116154704.png)

若采用静态空间管理策略，容量_capacity固定，则有明显的不足...

**上溢/overflow：** `_elem[]`不足以存放所有元素，尽管此时系统往往仍有足够的空间

**下溢/underflow：** ` _elem[]`中的元素寥寥无几，**装填因子 λ** = _size / _capacity  << 50%

## 动态空间管理策略

在即将**上溢**时，适当扩大内部数组的容量

### 递增策略

当需要扩容时，为`_capacity`追加固定大小的空间，即

```c
T* oldElem = _elem; _elem = new T[ _capacity += INCREMENT ];
```

考虑最坏情况，在初始容量为0的空向量中连续插入n = m*`I`个元素

那么，在第1，`I`+1，`2I`+1，`3I`+1...次插入元素时都需要扩容，表示为

![递增策略](https://gitee.com/fintinger/figure-bed/raw/master//images/20201116161055.png)

### 倍增策略

当需要扩容时，增加`_capacity` 为原来的两倍，即

```c
T* oldElem = _elem; _elem = new T[ _capacity <<= 1 ];
```

考虑最坏情况，在初始容量为**1**的空向量中连续插入n = `2^m`个元素

那么，在第1，2，4，8...次插入元素时都需要扩容，表示为

![倍增策略](https://gitee.com/fintinger/figure-bed/raw/master//images/20201116162233.png)

### 两种策略的复杂度分析

考虑最坏的情况，两种策略的复杂度分别为

- **递增策略：** 为算术级数，0+`I`+`2I`+...=O(n ²)
- **倍增策略：** 为几何级数，1+2¹+2²+2³+...=O(2^m)=O(n)

|            | 递增策略 | 倍增策略 |
| :--------- | :------: | :------: |
| 累计时间   |  O(n ²)  |   O(n)   |
| 分摊时间   |   O(n)   |   O(1)   |
| 装填因子 λ |  ≈100%   |   >50%   |

可以看出，倍增策略在牺牲空间的基础上，换取时间上的巨大提升，可采取√

> 注意这里用到了分摊分析的概念，区别于平均/期望分析

