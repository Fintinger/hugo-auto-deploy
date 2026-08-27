---
title: 从零实现一个3D卡片的镜面倒影效果
date: 2024-01-18
categories:
- 前端
- CSS
tags:
- CSS 3D
- Vue.js
- 镜面倒影
- clip-path
- mask
- 浏览器渲染
---

## 背景

在为 ACMUSIC（网易云第三方客户端）的私人FM模块添加镜面倒影效果时，遇到了一个有趣的技术挑战：镜面倒影明明 DOM 结构正确、transform 也没问题，但就是不可见。这篇文章记录了排查过程和最终的解决方案。

## 1. 三层结构设计

倒影系统采用三层嵌套结构：

```
.fm-card-wrapper（3D 变换容器）
  ├─ .fm-card（封面卡片，340×340, border-radius 28px）
  └─ .fm-reflection-plane（倒影裁剪平面）
       └─ .fm-reflection（倒影元素，scaleY(-1) 翻转）
            └─ img（封面图片，340×340）
```

关键设计思路：

- **plane**：position 在卡片正下方，`overflow: hidden` + `border-radius: 28px` 负责裁剪倒影可见区域和圆角
- **reflection**：position 在 plane 内部，通过 `transform: scaleY(-1)` 实现垂直镜像
- **img**：复用封面图片，`object-fit: cover` 填充

## 2. 核心 CSS

### 2.1 Plane——裁剪平面

```scss
.fm-reflection-plane {
  position: absolute;
  left: 0;
  top: 100%;                    // 紧贴卡片底部
  width: 100%;
  height: 410px;                // 关键：高度要足够大
  overflow: hidden;             // 裁剪可见区域
  pointer-events: none;
  border-radius: 28px;          // 与卡片圆角一致
  // 真正的可见高度由 clip-path 控制
  clip-path: inset(0 0 300px 0); // 顶部 110px 可见
}
```

### 2.2 Reflection——镜像元素

```scss
.fm-reflection {
  position: absolute;
  left: 0;
  top: 340px;                   // 关键定位值
  width: 100%;
  height: 340px;
  overflow: hidden;
  opacity: 0.22;
  filter: blur(3px);            // 模糊模拟镜面
  transform: scaleY(-1);        // 垂直翻转
  transform-origin: center top; // 以顶部为轴翻转
  mask-image: linear-gradient(
    to top,                     // 从底部（靠近卡片）向上渐隐
    rgba(0,0,0,.78) 0%,        // 卡片边缘 - 最清晰
    rgba(0,0,0,.45) 15%,       // 中段 - 快速衰减
    rgba(0,0,0,.18) 25%,
    rgba(0,0,0,.04) 32%,       // 尾部 - 接近消失
    transparent 35%             // 完全透明（clip 边界前）
  );
}
```

## 3. 核心问题：浏览器 culling 导致倒影不可见

### 3.1 问题现象

DOM 结构正确，CSS transform 也正确，但倒影完全不可见。即使用纯红色背景（opacity:1, mask:none）替换图片，plane 区域内仍然看不到任何内容。

### 3.2 根因分析

问题出在浏览器的**渲染裁剪优化（culling）**机制上。

.reflection 元素在 plane 内部定位为 `top: 340px`，它的**布局盒子**（layout box）在 plane 坐标系中占据 `[340, 680]` 的范围。而 plane 的 `overflow: hidden` 裁剪区域是 `[0, 410]`（410px 是 plane 的高度）。

```text
plane 裁剪区域:     [0px ──────── 410px]
reflection 布局盒:             [340px ──────── 680px]
                                 ↑
                          重叠仅 70px（临界值）
```

浏览器在渲染前会做一次**粗略裁剪判断**：如果某个子元素的布局盒子与父元素的裁剪区域**重叠不足一定阈值**（约 20-40px），Chrome 会直接跳过该元素的渲染，认为它"完全不可见"。

问题就出在这里。虽然 `scaleY(-1)` 会把 reflection 的视觉内容翻转到 plane 裁剪区域 `[0, 110]`，但浏览器在进行 culling 决策时**只看布局盒子，不看 transform 的结果**。

### 3.3 验证实验

通过 CDP 测试不同 `top` 值的渲染情况：

| refletion top | 布局盒在 plane 内重叠 | 是否渲染 |
|---|---|---|
| 340px | 0-40px | ❌ 被 culling |
| 60px | ~30px | ❌ 临界值 |
| 40px | ~40px | ✅ 可见 |
| 0px | 70px | ✅ 可见 |

实验证明：当 layout box 在父级 clip 区域内重叠**超过阈值**时，浏览器才会真正渲染；否则即使 transform 会把它移入可视区，也会被跳过。

### 3.4 解决方案

**方案一：增加 plane 高度**（曾尝试）
- 将 plane 高度从 70px 提升到 410px
- 布局重叠达到 70px，浏览器不再 culling
- 但 plane 太高，倒影延伸过长

**方案二：clip-path 修剪**（最终采用）
- plane 保持 410px 高度（满足 culling 重叠阈值）
- 使用 `clip-path: inset(0 0 300px 0)` 将**视觉显示区域**修剪到 110px
- clip-path 作用在渲染后期，不影响浏览器初始的 culling 判断
- `overflow: hidden` 负责布局裁剪判断（决定是否渲染）
- `clip-path` 负责视觉裁剪（控制实际显示多少）

```text
                        plane 布局盒 (410px)
┌─────────────────────────────────────┐
│  clip-path: inset(0 0 300px 0)     │ ← 视觉显示 110px
│  ┌─────────────────────────────┐    │
│  │     可见倒影区域 (110px)    │    │
│  └─────────────────────────────┘    │
│  ├────── 被裁剪隐藏 (300px) ────┤   │
│                                     │
│  reflection 布局盒 [340,680]        │ ← 重叠 70px > 阈值 → 不 culling
└─────────────────────────────────────┘
```

## 4. mask 渐隐方向陷阱

### 4.1 问题

在 `scaleY(-1)` + `top: 340px` 的几何配置下，plane 的可见窗口（110px）对应 reflection 元素的**底部 110px**（元素局部 y 坐标 `[230, 340]`）。

如果使用 `mask-image: linear-gradient(to bottom, ...)`：
- mask 的 `to bottom` 方向：0% = 元素顶部 `.78`，100% = 元素底部 `0`
- 可见窗口在元素底部，mask 值 ≈ `0` → **完全被 mask 掉**

### 4.2 解决

使用 `mask-image: linear-gradient(to top, ...)`：
- mask 的 `to top` 方向：0% = 元素底部 `.78`，100% = 元素顶部 `0`
- 可见窗口在元素底部，mask 值从 `.78` 开始 → **倒影可见且靠近卡片最清晰**

```text
to bottom（错误）:      to top（正确）:
  0%  .78 ─┐               0%  .78 ←─ 元素底部（靠近卡片）
            │                         │
  100%   0 ←┘ 元素底部        100%   0 ←─ 元素顶部
  ↑                            ↑
可见窗口 mask≈0             可见窗口 mask≈.78→.04
```

### 4.3 断层问题

另一个细节：mask 梯度的 **transparent 必须设置在 clip-path 边界之前**。

clip-path 在 110px 处（梯度 32.4%）做硬切。如果此时 mask 还有残留值（如 `.26`），就会看到明显的「断层」——倒影突然消失。将 `transparent` 设在 35%，使 clip 边界处 mask 已衰减到 `.017`，切边几乎不可见。

## 5. 侧卡（3D 旋转卡）的特殊处理

previous/next 卡片有 `rotateY(±48deg)` 3D 变换，倒影需要额外处理：

- **hover 动画**：`translateZ(-90→-45)`、`rotateY(48→38)`、`scale(1→1.03)`
- **倒影增强**：hover 时 opacity +30%，blur 降低到 0
- **宽度自适应**：plane 和 reflection 使用 `width: 100%` 继承 3D 变换后的视觉宽度
- **position 补偿**：rotateY 导致视觉 gap 与 current 不一致，需额外 `+2px` 补偿

## 6. 总结

| 问题 | 根因 | 解决 |
|---|---|---|
| 倒影不可见 | 浏览器 culling 只看布局盒不看 transform | plane 增高 + clip-path 修剪 |
| mask 方向错误 | `to bottom` 使可见区域 mask≈0 | 改为 `to top` |
| 倒影底部断层 | mask 未在 clip 边界前归零 | transparent 设在 35%（边界 32.4%） |
| 侧卡 gap 不一致 | rotateY 透视投影 | 侧卡 plane 补偿 `+2px` |

这次开发让我深刻理解了一个经常被忽略的浏览器渲染行为：**culling 基于布局盒而非视觉位置**。在涉及 `transform` 将内容移入可视区域时，需要确保布局盒本身与裁剪区域有足够重叠，否则内容会被浏览器直接跳过渲染。

## 最终效果

```text
     ┌──────────┐
     │  COVER   │  ← 卡片
     └──────────┘
        ↓↓↓↓↓
      镜像颜色   ← 倒影（最清晰）
        ↓↓↓
       逐渐消失  ← 自然渐隐
```
