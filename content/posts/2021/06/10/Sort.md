---
title: 排序算法相关
date: 2021-06-10
categories:
 - 后端
tags:
 - 数据结构
 - 冒泡排序
 - 选择排序
 - 插入排序
 - 快速排序
 - 归并排序
 - 计数排序
 - 希尔排序
 - 堆排序
image: https://picsum.photos/seed/paixu/640/360
---


| 排序算法     | 平均时间复杂度 | 空间复杂度 | 稳定性 | 适用情况                |
| ------------ | -------------- | ---------- | ------ | ----------------------- |
| 插入排序     | $O(n^2)$       | O(1)       | 稳定   | n较小，初始序列基本有序 |
| 希尔排序     | $O(n^{1.3})$   | O(1)       | 不稳定 |                         |
| 冒泡排序     | $O(n^2)$       | O(1)       | 稳定   | n较小，初始序列基本有序 |
| 快速排序     | $O(n\log_2n)$  | $O(nlog_2n)$ | 不稳定 | 初始序列无序            |
| 简单选择排序 | $O(n^2)$       | O(1)       | 不稳定 | n较小                   |
| 堆排序       | $O(n\log_2n)$  | O(1)       | 不稳定 | n较大或只排前几位       |
| 2-路归并排序  | $O(n\log_2n)$ | O(n)       | 稳定   | n很大                   |
| 链式基数排序 | $O(d(n+rd))$ | $O(rd)$ | 稳定 |n大，关键字值小|


<!-- more -->

## 相关概念

### 1.评价指标

时间复杂度，空间复杂度，算法的**稳定性**

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606155832.png)

### 2.分类

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210606155837.png)

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610164946.png)


## 插入排序

### 1.算法思想

每次将⼀个待排序的记录按其关键字⼤⼩插⼊到前⾯已排好序的⼦序列中， 直到全部记录插⼊完成。

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610115037.gif)

### 2.代码实现

```cpp
//递增排序
void InsertSort(int A[],int n){//长度为n的int型数组
    int i,j,temp;
    for (i = 1; i < n; i++)
        if (A[i] < A[i-1]) {//如果A[i]的小于其前驱则进行A[i]的移动
            temp=A[i];//临时保存A[i]
            for (j = i-1; j>=0 && A[j]>temp; j--)//依次检查A[i]之前已经排好序的元素
                A[j+1]=A[j];//大于temp的后移
            A[j+1]=temp;//最终复制到插入位置
        }
}
```

### 3.优化思路

**折半插入排序**——先用折半查找找到应该插入的位置，再进行移动元素。

```cpp
void InsertSort(int A[],int n){
    int i,j,low,high,mid;
    for (i = 2; i < n; i++) {
        A[0]=A[i];
        low=1,high=i-1;//折半查找的范围
        while (low<=high) {
            mid=(low+high)/2;
            if (A[mid>A[0]]) high=mid-1;//查找左部分
            else low=mid+1;//查找右部分
        }
        for (j = i-1; j>=high+1; j--)//i之前元素全部后移
            A[j+1]=A[j];
        A[high+1]=A[0];//插入
    }
}
```

**注意：**  一直到low>high时才停止折半查找当mid所指元素等于当前元素时，应继续令low=mid+1，以保证<u>“稳定性“</u>。最终应将当前元素插入到low所指位置（即high+1）

## 希尔排序

### 1.算法思想

先将待排序表分割成若干形如 {i,i+d,i+2d, ... , i+kd} 的“特殊”子表，对各个子表分别进行直接插入排序。缩小增量d(建议缩小一半)，重复上述过程，直到d=1为止。

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610115346.png)

### 2.代码实现

```cpp
void ShellSort(int A[],int n){
    int i,j,d;
    for (d = n/2; d >= 1; d=d/2) //步长不断衰减
        for ( i = d+1; i <= n; i++) //遍历各步长为d的子表,从子表第二个元素开始处理即可
            if(A[i]<A[i-d]){//如果发现逆序
                A[0]=A[i];//暂存需要交换位置的A[i]
                for ( j = i-d; j > 0 && A[0]<A[j]; j-=d) //当子表中存在元素，判断与A[i]大小，寻找A[i]插入位置
                    A[j+d]=A[j];//子表记录后移
                A[j+d]=A[0];//插入
            }//if
}
```

## 冒泡排序

### 1.算法思想

从后往前（或从前往后）两两比较相邻元素的值，若为逆序（即A[i-1]>A[i]），则交换它们，直到整个序列比较完毕。

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610114840.gif)

### 2.代码实现

```cpp
void swap(int &a,int &b){
    int temp=a;
    a=b;
    b=temp;
}
void BubbleSort(int A[],int n){
    for (int i = 0; i < n; i++){ //i之前的所有元素必然已经有序
        bool flag=false;
        for (int j = n-1; j > i; j--) //从后往前的一趟冒泡
            if (A[j-1] > A[j]) {//逆序,(相等不会交换，是稳定的)
                swap(A[j-1],A[j]);
                flag=true;
            }//if
        if (!flag) {
            return;//本趟遍历flag未改变，说明已经有序,可能会提前结束
        }
    }//for
}
```

## 快速排序

### 1.算法思想

在待排序表L[1...n]中<span style="background:#fff006">任取一个元素 pivot作为枢轴</span>（或基准，通常取首元素），通过一趟排序将待排序表<span style="background:#fff006">划分为独立的两部分</span>L[1...k-1]和L[k+1...n]使得L[1...k-1]中的所有元素小于pivot，L[k+1...n]中的所有元素大于等于pivot，则 pivot放在了其最终位置L[k]上这个过程称为一次“划分”。然后分别递归地对两个子表重复上述过程，直至每部分内只有一个元素或空为止，即所有元素放在了其最终位置上。

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610115122.gif)

### 2.代码实现

```cpp
void QuickSort(int A[],int low,int high) {//快速排序
    if (low<high) {//递归跳出的条件
        int pivotpos=Partition(A,low,high);//进行“划分”
        QuickSort(A,low,pivotpos-1);//处理左子表
        QuickSort(A,pivotpos+1,high);//处理右子表
    }
}
int Partition(int A[],int low,int high){//"划分"函数，返回 枢轴 位置
    int pivot=A[low];//取low作为枢轴
    while (low<high) {//用low,high搜寻枢轴位置
        while (low<high && A[high]>pivot) high--;
        A[low]=A[high];//比枢轴小的元素移动到左端
        while (low<high && A[low]<pivot) low++;
        A[high]=A[low];//比枢轴大的元素移动到右端
    }
    A[low]=pivot;//改变枢轴low位置
    return low;
}
```

### 3.优化思路

枢轴的选择会直接影响快速排序算法的效率，因此<span style="color:#e01">优化应该从枢轴的选择角度考虑</span>。

① 选择首、中、尾三个位置的元素，取其中中间值作为枢轴元素。

② 随机选一个作为枢轴……

### 4.注意

>  “一次划分” 与 “一趟排序”
>
> - 一次划分可以确定一个元素的最终位置
> - 一趟排序也许可以确定多个元素的最终位置
>
> ![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210607102653.png)

## 简单选择排序

### 1.算法思想

每一趟在待排序元素中选取关键字最小的元素加入有序子序列

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610115005.gif)

### 2.代码实现

```cpp
void swap(int &a,int &b){
    int temp=a;
    a=b;
    b=temp;
}

void SelectSort(int A[],int n) {
    for (int i = 0; i < n-1; i++) {//从头开始遍历，最后一个元素无需处理(最终一定是最大)
        int min=i;//初始最小元素位置
        for (int j = i+1; j < n; j++) //在i之后所有元素中寻找最小元素位置
            if (A[j]<A[min]) min=j;//更新最小元素位置
        if (min!=i) swap(A[min],A[i]);//将最小元素置于表头
    }
}
```

## 堆排序☆

堆这种数据结构可以类比完全二叉树二叉树结构的顺序存储

![](https://img-blog.csdnimg.cn/2021050722150754.gif#pic_center)

### 1.建立大根堆

<span style="border:2px dashed #e01;padding:3px 5px">核心特性：  根≥左，右</span>

#### 思路

把所有<span style="background:#fff006">非终端结点($i \leq \left \lfloor n/2 \right \rfloor$)</span>都检查一遍，是否满足大根堆的要求。

检查当前结点是否满足 根≥左、右，若不满足，将<span style="color:#e01">当前结点与更大的一个孩子</span>互换。

若<u>元素互换破坏了下一级的堆</u>，则采用相同的方法继续往下调整（小元素不断“下坠”）

#### 代码实现

```cpp
void BuildMaxHeap(int A[],int len){
    for (int i = len/2; i > 0; i--)//从编号最大非终端节点开始 
        HeadAdjust(A,i,len);
}

//调整以k为根节点的树为大根堆
void HeadAdjust(int A[],int k,int len){
    A[0]=A[k];
    //寻找A[k]应该插入的位置--“下坠”
    for (int i = 2*k; i <= len; i*=2) {
        if (i<len&&A[i]<A[i+1]) //找到key更大的子结点的下标
            i++;
        if(A[0]>=A[i]) break;//满足“根”>左、右，end for
        else{
            A[k]=A[i];//将A[i]调整到双亲结点上
            k=i;
        }
    }//for
    A[k]=A[0];//已找到应该插入的位置
}
```

### 2.大根堆排序

 #### 算法思想

利用大根堆 <u>根≥左，右</u> 的特性，

Step1 交换堆顶与堆底元素

Step2 去掉堆底元素，len-1，重新调整为大根堆结构（HeadAjust）

Loop step1 , step2.

#### 代码实现

```cpp
void BuildMaxHeap(int A[],int len);
void HeadAdjust(int A[],int k,int len);
void swap(int &a,int &b);

void HeapSort(int A[],int n){
    BuildMaxHeap(A,n);//初始建立大根堆
    for (int i = n; i > 1; --i) { //n-1趟交换与建堆
        swap(A[i],A[1]);//堆底与堆顶元素互换
        HeadAdjust(A,i,i-1);//剩余待排序元素整理成堆
    }
}
```

> 基于大根堆数据结构，经过排序后得到 升序序列
> 基于小根堆数据结构，经过排序后则会得到 降序序列

### 3.效率分析

<span style="border-bottom:3px solid #67b440">对于`BuildMaxHeap(A,n)`</span>

不难得出，对于一个结点，每"下坠"一层，最多只需对比关键字*2*次(子树之间对比，根与子树中较大的对比)

若树高为h，某结点在第i层，则将这个结点向下调整最多只需要"下坠"*h-i*层，关键字对比次数不超过*2(h-i)*

而*n*个结点的完全二叉树树高$h=\left \lfloor \log_2n \right \rfloor+1$

第 i 层最多有$2^{i-1}$个结点，而只有第1~（h-1）层的结点才有可能需要“下坠”调整

故将整棵树调整为大根堆，关键字对比次数不超过

$\sum_{i=h-1}^{1} 2^{i-1} 2(h-i)=\sum_{i=h-1}^{1} 2^{i}(h-i)=\sum_{j=1}^{h-1} 2^{h-j} j \leq 2 n \sum_{j=1}^{h-1} \frac{j}{2^{j}} \leq 4 n$

<span style="color:#e01">建堆的过程,关键字对比次数不超过4n，建堆时间复杂度=O(n)</span>

<span style="border-bottom:3px solid #67b440">对于n-1趟交换与建堆</span>

根节点最多“下坠” h-1 层，

⽽每“下坠”⼀层，最多只需对⽐关键字2次，

因此每⼀趟排序复杂度不超过 $O(h) = O(log_2n)$ 共n-1 趟，

总的时间复杂度 = $O(nlog_2n)$



因此，

<span style="border:2px dashed #e01;padding:3px 5px">堆排序时间复杂度=$O(n) + O(nlog_2n)=O(nlog_2n)$ </span>

### 4.堆的插入与删除

#### 4.1 插入

对于小根堆，新元素放到<u>表尾</u>，与父节点对比，若<u>新元素比父节点更小，则将二者互换</u>。新元素就这样一路"上升"，<u>直到无法继续上升为止</u>。

#### 4.2 删除

<span style="color:#e01">被删除的元素用堆底元素替代</span>，然后让该元素不断“下坠”，直到无法下坠为止

## 归并排序

### 1.算法思想

对于一个给定的序列

第一趟，将每1个元素看做一个组，相邻的两组进行二路归并

第二趟，将每相邻的2个有序元素序列看做一组，相邻的两组进行二路归并

第三趟，将每相邻的4个有序元素序列看做一组，相邻的两组进行二路归并

....

直至所有元素都有序

![图片来自CSDN@非晚非晚](https://gitee.com/fintinger/figure-bed/raw/master//images/20210610115158.gif)

### 2.代码实现

```cpp
int *B=(int *)malloc(n*sizeof(int));//辅助数组，长度等于A数组

//A[low...mid]和A[mid+1...high]各自有序，将两个部分归并
void Merge(int A[],int low,int mid,int high) {
    int i,j,k;
    for (k = low; k <= high; k++) //将A[low...high]复制到B
        B[k]=A[k];
    for (i = low,j=mid+1,k=i; i <= mid&&j<=k; k++) {//归并
        if (B[i]<=B[j]) //较小者复制到A中
            A[k]=B[i++];
        else A[k]=B[j++];
    }//for
    while (i<=mid) A[k++]=B[i++];
    while (j<=high) A[k++]=B[j++];
}

void MergeSort(int A[],int low,int high) {
    if (low<high) {
        int mid=(low+high)/2;//从中间划分
        MergeSort(A,low,mid);//左部分归并
        MergeSort(A,mid+1,high);//右部分归并
        Merge(A,low,mid,high);//两部分归并
    }
}
```

> 关于`merge`方法可以对照下图理解
>
> ![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609083921.png)

## 基数排序

 <span style="border:2px dashed #e01;padding:3px 5px">基数算法不是基于“比较”的排序算法</span>

### 1.算法思想

（具体的例子）

对于一个元素最高位为3位数的序列，将不足3位的元素前面补0.

第一趟 按“个位“<u>分配、收集</u>：得到按“个位”递减排序的序列

第二趟按“十位分配、收集：得到按“十位”递减排序的序列，“十位相同的按“个位递减排序

第三趙按“百位”分配、收集：得到一个按“百位递减排列的序列，若“百位”相同则按“十位递减排列，若“十位还相同则按“个位递减排列。

**定义如下**

 ![image-20210609101712975](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609101720.png)

### 2.效率分析

#### 2.1 空间

需要 r 个辅助队列，空间复杂度 = O(r)

#### 2.2 时间

⼀趟分配O(n)，⼀趟收集O(r)，总共 d 趟分配、收集，总的时间复杂度=$O(d(n+r))$

#### 2.3稳定性

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609103004.png)

### 3.拓展应用

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210609103234.png)

<span style="border-bottom:3px solid #67b440">应用方向</span>

①数据元素的关键字可以⽅便地拆分为 d 组，且 d 较⼩  

②每组关键字的取值范围不⼤，即 r 较⼩  

③数据元素个数 n 较⼤

