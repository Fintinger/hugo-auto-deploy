---
title: 减而治之与分而治之
date: 2020-11-15
categories:
 - 学习总结
tags:
 - 数据结构
image: https://picsum.photos/seed/Decreaseconquer/640/360
---

## 减而治之(Decrease and conquer)

> 什么是“减而治之”？
>
> 为求解一个大规模的问题，可以将其划分为两个问题，其一**平凡**，另一**规模缩减** ，分别求解子问题，由子问题的解得原问题的解

![减而制之](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115141617.png)

比如说，对于一个数组A的求和问题，可以设计如下的算法

```c
sum( int A[], int n ) { 
    return 
        n < 1? 
        0 : sum(A, n - 1) + A[n - 1]; 
}
```

当规模缩减到一定程度后，抵达**递归基**，返回0

### 复杂度分析

**1. 递归跟踪**

> 绘出计算过程中出现过的所有递归实例（及其调用关系） ，那么它们各自所需时间之总和，即为整体运行时间

上例中，共计n+1个递归实例([分析](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115143624.PNG))，各自只需O(1)时间 故总体运行时间为：

`T(n) =O(1) × (n+1) =O(n)`

**2.递推方程**

> 对于大规模的问题、复杂的递归算法，递归跟踪不再适用 此时可采用另一抽象的方法...

在本例中，有`T(n)=T(n-1) + O(1)`,`T(0)=O(1)`

则，`T(n) = T(n-2)+O(2) = T(n-3)+O(3) = T(n-n)+O(n)=O(n)`

> 可以看到，两种分析方法的出来复杂度都为O(n)

## 分而治之(Divide and conquer)

> 什么是“分而治之”？
>
> 为求解一个大问题，可以将其划分为若干子问题，规模大体相当（可理解为将大问题等分），分别求解子问题，由子问题的解得原问题的解

![分而治之](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115150641.png)

对于数组A的求和问题，利用分而治之的思想可以设计出下面的算法

```c
sum( int A[], int lo, int hi ) {//区间范围A[lo, hi) 
 if ( hi - lo < 2 ) return A[lo]; 
 int mi = (lo + hi) >> 1; 
 return sum( A, lo, mi ) + sum( A, mi, hi );
 } //入口形式为sum( A, 0, n )
```

### 复杂度分析

**1.递归跟踪**

对于上述算法，[分析](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115192302.png)可知，其复杂度

`T(n)=O(1) × (1+2¹+2²+...+2^㏒n) = O(1) × (2^logn - 1) = O(n)`

更快捷地，作为几何级数，其复杂度与末项同阶，因此由[分析](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115192302.png)图可知，其末项共有n项[(0,0)，(1,1,) ... (n,n)]，因此其复杂度为O(n)

**2.递推方程**

为求解sum(A,lo,hi),

需求解 sum(A, lo, mi) 和 sum(A, mi+1, hi) => T(n/2)

进而将子问题累加 =>O(1)

递归基sum(A, lo, lo) => O(1)

递推关系：T(n)=2·T(n/2) + O(1) ===> T(n) = O(n)

