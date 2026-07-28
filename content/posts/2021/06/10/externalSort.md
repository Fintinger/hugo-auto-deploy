---
title: 外部排序相关
date: 2021-06-10
categories:
 - 后端
tags:
 - 数据结构
 - 外部排序
 - 败者树
 - 置换选择排序
 - 最佳归并树
image: https://picsum.photos/seed/waibupaixu/640/360
description: 由于数据元素太多，无法一次全部读入内存进行内部排序，这是就要通过外部排序来解决...
---

 ## 外部排序

> 由于数据元素太多，无法一次全部读入内存进行内部排序，这是就要通过外部排序来解决

### 1.外排原理

<p style="border-left:5px solid #67b440;padding:8px 8px;color:#676767;background:#F8EFBA">目的：通过内存的读写操作(每次读写操作都是成块的进行，比如每次1KB)，将存放于磁盘中的大量数据变得有序。</p>

(拿二路归并举例)

如图，对于在磁盘中分块存放的数据，每块存入三个元素，共16块

在内存中建立三个缓冲区输出缓冲区、输入缓冲区1以及输入缓冲区2

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609111419.png)

#### 1.1构造初始归并段

首先，依次地读入前两**块**数据，分别存入内存中的 缓冲区1、缓冲区2

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609113017.png)

将输入缓冲区1以及输入缓冲区2中存放的数据经过 内存中的二路归并排序(内排)后，将生成的有序的块经 输出缓冲区 写入磁盘 得到一个有序的<span style="color:#e01">归并段</span>

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609112932.gif)

同样的，对剩余块进行同样的操作可以得到

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609113254.png)

#### 1.2以归并段为单位进行归并

分别选取归并段1和2中较小的一块，依次读入至缓冲区1,2

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609113814.png)

内排之后，写入内存，注意，<span style="color:#e01">输入缓冲区1(或2)空缺后要立即在归并段1(或2)中读入新的块到其中进行归并排序</span>

（以保证输出缓冲区始终输出归并段中较小的元素）

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609114302.png)

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609114619.png)

最终，完成所有归并段的第一趟归并之后，会有

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609114751.png)

之后，4块成一个归并段，两两归并

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609114841.png)

……

最终。经过<u>3趟归并</u>，整体会变得有序！

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609115011.png)

### 2.优化思路

#### 2.1时间开销分析

在整个排序过程中，时间开销分析如下

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609115234.png)

可以看到，

<span style="background:#fff006">外部排序时间开销=读写外存的时间+内部排序所需时间+内部归并所需时间</span>

而读写外存时间是关键的时间开销，因此优化应该针对<span style="color:#e01">怎么减少读写外存的次数</span>展开

而文件总块数无法优化，只能针对<span  style="color:#e01">归并的趟数优化</span>

为此，我们需要采用多路归并来解决

#### 2.3结论

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609120244.png)

#### 2.4 优化思路一：采用多路归并

对上面的例子，如果采用四路归并

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609115942.png)

只需96次读写即可！！

#### 2.5 优化思路二：减少初始归并段数量r

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609120641.png)

## 败者树

<p style="border-left:5px solid #67b440;padding:8px 8px;color:#676767;background:#F8EFBA">归并段数增加之后，内存中缓冲区数目增加，从中对比得出最小关键字的对比次数也会随之增多……</p>

 ### 1.算法思想

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610100109.png)

构造 如图所示的树结构，叶节点对应（脑补）各归并段（假设共有8个归并段），<u>分支结点记录败者来自哪个归并段</u>，最后根节点记录冠军来自哪个归并段，并且将冠军输出，为这8个归并段中的最小值。

下轮选择冠军记录的那个归并段（归并段3）中的元素6，代替1的位置，如图，并依次向上的与各败者结点对比，胜则往上，败则留下，最终输出冠军

接下来，循环这个过程

### 2.效率分析

对于k路归并，第一次构造败者树需要对比关键字k-1次
有了败者树，选出最小元素，只需对比关键字次$\left \lceil \log_2k \right \rceil$

## 置换选择排序

<p style="border-left:5px solid #67b440;padding:8px 8px;color:#676767;background:#F8EFBA"><span style="color:#e01">⽤于内部排序的内存⼯作区</span>WA可容纳l个记录，则每个初始归并段也只能包含l个记录，若⽂件共有n个记录，则初始归并段的数量r=n/l,这是之前的做法
</p>

### 1.算法思想

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610105056.png)

设初始待排文件为F，初始归并段输出文件为FO，内存工作区为WA,FO和WA的初始状态为空，WA可容纳w个记录。置换选择算法的步骤如下：
1）从F输入个记录到工作区WA。
2）从WA中选出其中关键字取最小值的记录，记为 MINIMAX记录3）将MINIMAX记录输出到FO中去。
4）若F不空，则从F输入下一个记录到WA中。
5）从w中所有关MINIMAX键字比记录的关键字大的记录中选出最小关键字记录，作为新的MINIMAX记录。
6）重复3）~5），直至在A中选不 MININ出新的记录为止，由此得到一个初始归并段，输出一个归并段的结束标志到FO中去。
7）重复2）~6），直至WA为空。由此得到全部初始归并段。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610105913.png)

## 最佳归并树

> 利用置换选择排序构造初始归并段，归并段长短不一

对于一个归并树，如图数字表示该归并段占多少个磁盘块。

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610110612.png)

每个初始归并段看作⼀个叶⼦结点，归并段的⻓度作为结点权值，则 上⾯👆这棵归并树的带权路径⻓度 WPL = 2*1 + (5+1+6+2) * 3 = 44 

重要结论：<span style="background:#fff006">归并过程中的磁盘I/O次数 = 归并树的WPL * 2 16 = 读磁盘的次数 = 写磁盘的次数</span>

因此

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610111121.png)

我们可以构造出一棵带权路径最小的归并树——[哈夫曼树](https://www.fintinger.site/blogs/2021/05/23/HuffmanTree.html#%E6%9E%84%E9%80%A0%E5%93%88%E5%A4%AB%E6%9B%BC%E6%A0%91)！

注意：

<span style="color:#e01">对于k叉归并，若初始归并段的数量⽆法构成严格的 k 叉归并树， 则需要补充⼏个⻓度为 0 的<u>“虚段”</u>，再进⾏ k 叉哈夫曼树的构造</span>

> ①若（初始归并段数量 -1）% （k-1）= 0，说明刚好可以构成严格k叉树，此时不需要添加虚段  
> ②若（初始归并段数量 -1）% （k-1）= u ≠ 0，则需要补充 (k-1) - u 个虚段

