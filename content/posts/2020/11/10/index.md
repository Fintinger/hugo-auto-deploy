---
title: DS导论
date: 2020-11-10
categories:
 - 学习总结
tags:
 - 数据结构
image: https://picsum.photos/seed/dsdl/640/360
---

# 导论

>  所谓算法，即特定计算模型下，旨在解决特定问题的指令序列。输入：待处理的信息（问题）输出：经处理的信息（答案）

**正确性** 的确可以解决指定的问题 

**确定性** 任一算法都可以描述为一个由基本操作组成的序列 

**可行性** 每一基本操作都可实现，且在常数时间内完成 

**有穷性** 对于任何输入，经有穷次基本操作，都可以得到输出

::: tip
Algorithms + Data Structures = Programs

(Algorithms + Data Structures) x Efficiency = Computation

:::

## 如何评判算法的其优劣(计算模型)

> 实验统计是最直接的方法，但足以准确反映算法的真正效率？不足够！ - 不同的算法，可能更适应于不同规模的输入 - 不同的算法，可能更适应于不同类型的输入 - 同一算法，可能由不同程序员、用不同程序语言、经不同编译器生成 - 同一算法，可能实现并运行于不同的体系结构、操作系统...
> 为给出客观的评判，需要抽象出一个理想的平台或模型 - 不再依赖于上述种种具体的因素 - 从而直接而准确地描述、测量并评价算法

### 1.图灵机模型(TM)

![示意图](https://gitee.com/fintinger/figure-bed/raw/master//images/20201110122012.png)

| 组成     | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| Tape     | 依次均匀地划分为单元格 各存有某一字符，初始均为'#'           |
| Head     | 总是对准某一单元格，并可 读取或改写其中的字符。每经过一个节拍，可 转向左侧或右侧的邻格 |
| Alphabet | 字符的种类有限                                               |
| State    | TM总是处于有限种状态中的某一种 。每经过一个节拍 可按照规则转向另一种状态 。统一约定，'h' = halt(停止) |

### 2.RAM模型(Random Access Machine)

![PAM模型](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115121515.png)

**语法：**

- 赋值操作 `R[i] <- C` , `R[i] <- R[j]`, `R[i] <-R[R[j]]`
- 仅加减运算 `R[j] + R[k]` `R[i] <- R[j] + R[k]`
- 判断语句 `IF R[i] = 0 GOTO #`
- keyword `STOP`, `GOTO`

### 总之

在这些理想化模型中，

✨独立于具体的平台，假定空间是无限的(不考虑空间)，对算法的效率做出可信的比较与评判

✨算法的**运行时间** => 算法需要执行的基本**操作次数** 

✨T(n) = 算法为求解规模为n的问题，所需执行的基本操作次数

##  Big-O notation(大O记号)

> Big-O就是T (n)的上限，对一个具体的f(n) 不断放大产生的结果，下图就是Big-O的原理

![Big-O原理](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115123716.png)

**关系式**

`T(n) =O(f(n)) iff ∃c>0 s.t. T(n) < c.f(n)  ∀ n >> 2`

**规则**

✨常系数忽略，即`O(f(n)) = O(c*f(n))`

✨低次数项忽略，即`O(n^a+n^b) = O(n^a),a>b>0`

### 其他记号

**Ω记号** :表示T(n)的下界，Ω(f(n))

`T(n) =O(f(n)) iff ∃c>0 s.t. T(n) > c.f(n)  ∀ n >> 2`

 **Θ记号**：是O和Ω的结合

`T(n) =O(f(n)) iff ∃c₁>c₂>0 s.t. c₁·f(n) > T(n) > c₂·f(n)  ∀ n >> 2`

> 三者的关系可以用下图表示

![关系图](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115125420.png)

::: tip

不含转向(循环，调用，递归等)，必然是顺序执行，即是O(1)的复杂度

:::

### 几个注意点

**对数O(logn)**

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115133553.png)

**多项式复杂度**

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115133846.png)

## 级数

![层次级别](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115130322.png)

### 1.算术级数

`T(n)=1+2+3+...+n=n(n+1)/2 = O(n²)` 

::: tip

**与末项平方同阶**

:::

### 2. 幂方级数

`T₂(n)=1²+2²+3²+...+n²=n(n+1)(2n+1)/6 = O(n³)`

...

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115130436.png)

::: tip

**比幂次高出一阶**

:::

### 3.几何级数(a>1)

`T(n)=1+2+2²+...+2ⁿ=O(2ⁿ)`

::: tip

**与末项同阶**

:::

### 4.收敛级数

`1/1×2 + 1/2×3 + 1/3×4 +...+ 1/(n-1)·n= 1-1/n = O(1)`

几何分布：`(1- λ) · [1+ 2λ + 3λ² + 4λ³ +...]= 1/(1-λ)=O(1), 0<λ<1`

::: tip

收敛级数复杂度最终趋于常数，为O(1)

:::

### 5.未必收敛，但长度有限

![](https://gitee.com/fintinger/figure-bed/raw/master//images/20201115134527.png)



