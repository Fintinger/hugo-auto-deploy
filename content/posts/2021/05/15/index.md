---
title: 线索二叉树
date: 2021-05-15
categories:
 - 后端
tags:
 - 数据结构
---


# 线索二叉树

## WHY

> 方便从任一个结点出发，找到其前驱、后继；方便遍历

普通二叉树中，对任意一个结点，若想找到其前驱/后继结点，只能再进行一次相应的前/中/后序遍历才行，复杂度太高。

为此，我们引入**前驱线索**，**后继线索**的概念。其中，前驱线索由左孩子指针充当，后继线索由右孩子指针充当。

``` cpp
typedef struct  BiTNode{
    ElemType data;
    struct BiTNode *lchild,*rchild;
}BiTNode,*BiTree;
```

构建出如下图所示的结构：

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210512074747.png)

但是，

`*lchild`(`*rchild`)有可能指向存在的结点，为此我们引入线索标志。当**线索标志为1时，表示孩子指针指向前驱后继，线索标志为0时，表示孩子指针指向左右孩子**。此时

```cpp
typedef struct  ThreadNode{
    ElemType data;
    struct ThreadNode *lchild,*rchild;
    int ltag,rtag;//左右线索标志
}ThreadNode,*ThreadTree;
```

这样，每一个**线索链表**中的结点就可以图示为:

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210512080020.png)

## HOW

> 如何分别用代码实现前中后序遍历下的线索链表 

### 1.中序线索化

> 其实中序线索化的过程就是再进行一遍中序遍历，为每个节点添加额外的信息(lchild, rcild, ltag, rtag).

🍔初始定义结构体

```cpp
typedef struct ThreadNode{
    ElemType data;
    struct ThreadNode *lchild,*rchild;
    int ltag,rtag;
}ThreadNode,*ThreadTree;
```

🍔定义前驱指针

```cpp
ThreadNode *pre=NULL;
```

> 前驱指针还可以定义在局部，这里为了方便起见，将pre定义为全局。

🍔开始定义处理函数

```cpp
void CreatInThread(ThreadTree T){
    pre=NULL;
    if(T!=NULL){
        InThread(T);
        if(pre->rchild==NULL){
            pre->rtag=1;
        }
    }
}
```

> 注意：最后一个节点单独处理

🍔中序遍历二叉树，顺便线索化

```cpp
void InThead(ThreadTree T){
    if(T!=NULL){
        //左根右
        InThead(T->lchild);
        visit(T);
        InThead(T->rchild);
    }
}
```

🍔访问节点时加上线索信息

```cpp
void visit(ThreadNode q){
    if(q->lchild==NULL){
        q->lchild=pre;
        q->ltag=1;
    }
    if(pre!=NULL && pre->rchild==NULL){
        pre->rchild=p;
        pre->rtag=1;
    }
    pre=q;
}
```

此外，合并之后：

```cpp
void InThread(ThreadTree p,Thread &pre){
    if(p!=NULL){
        //左
        InThread(p->lchild,pre);
        //根
        if(p->lchild==NULL){
            p->lchild=pre;
            p->ltag=1;
        }
        if(pre!=NULL && pre->rchild==NULL){
            pre->rchild=p;
            pre->rtag=1;
        }
        pre=p;
        //右
        InThread(p->rchild,pre);
    }
}
void CreatInThread(ThreadTree T){
   ThreadTree pre=NULL;
    if(T!=NULL){
        InThread(T,pre);
        //处理最后一个节点
        pre->rchild==NULL
        pre->rtag=1;        
    }
}
```

> 注意在`CreatInThread`并不需要判断`pre->rchild`是否为`NULL`
>
> 因为，按照中序遍历的顺序“左根右”，最后退出循环之后`pre`不可能有`rchild`，否则还会按照“根右”的顺序继续执行`InThread`,所以退出循环的`pre`必然为中序遍历下的最后一个结点。

### 2.先序线索化

> 代码参考中序线索化

```cpp
void PreThead(ThreadTree T){
    if(T!=NULL){
        //根左右
        visit(T);
        PreThead(T->lchild);
        PreThead(T->rchild);
    }
}
```

由于先进行根节点的`vist`操作，如图，在`vist(4)`完成之后，根据规则，④的`lchild`指针指向②，因此就会陷入**无限循环**的困境……

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210515134148.png)

为此，只需在进行`PreThead(T->lchild)`前加一句判断即可，具体如下：

```cpp
void InThead(ThreadTree T){
    if(T!=NULL){
        //根左右
        visit(T);
        if(T->ltag==0){//lchild不是前驱线索时才访问lchild
                PreThead(T->lchild);
        }
        PreThead(T->rchild);
    }
}
```

其余参考中序线索化即可。

### 3.后续线索化

```cpp
void PreThead(ThreadTree T){
    if(T!=NULL){
        //左右根
        PreThead(T->lchild);
        PreThead(T->rchild);
         visit(T);
    }
}
```

其余参考中序线索化即可。

## WHERE

> 如何使用线索二叉树实现前中后序遍历下的查找前驱后继的问题

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210515140001.png)

### 1.中序线索二叉树

对于一颗中序线索化后的二叉树

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20210515140226.png)

🍖当某结点`ltag==1`时，前驱后继分别为`lchild,rchild`

🍖当某结点`ltag==0`时，根据中序遍历“左根右”的顺序：

- 前驱为`lchild`在中序遍历下**最后**被访问的那个结点
- 后继为`rchild`在中序遍历下**最先**被访问的那个结点

### 2.先序线索二叉树

🍖对于后继，参考中序线索二叉树即可。

🍖对于前驱，由于先序遍历“根左右”的遍历顺序，该节点无法找到前驱😰

- 解决办法一：从头至尾进行一次先序遍历，找到其前驱。

- 解决办法二：引入三叉树，为每个节点存储`parent`指针，即指向父节点，此时前驱为：

  ![image-20210515141736890](https://gitee.com/fintinger/figure-bed/raw/master//images/20210515141736.png)

### 3.后序线索二叉树

> 参考先序线索二叉树

### 4. 另外

🧐中序遍历下**最后**被访问的那个结点如何通过代码找到？

根据中序遍历 左根右 的顺序，即为最“右下”的结点，但**不一定是叶节点**哦

```cpp
ThreadNode *Lastnode(ThreadNode *p){
    while(p->rtag==0) p=p->rchild
    return p;
}
```