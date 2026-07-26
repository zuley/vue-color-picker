# Changelog

# [2.3.0](https://github.com/zuley/vue-color-picker/compare/v2.2.0...v2.3.0) (2026-07-26)


### Features

* **color-picker:** teleport 支持、色板键盘导航与工程化全面优化 ([389475f](https://github.com/zuley/vue-color-picker/commit/389475f3319db396bbb3f31461ea5b81220528e1))

# [2.2.0](https://github.com/zuley/vue-color-picker/compare/v2.1.0...v2.2.0) (2025-05-25)


### Features

* **a11y**：触发按钮与所有色块支持键盘聚焦（Tab）、激活（Enter/Space）；↑↓ 打开面板，Esc 关闭并归还焦点；ARIA roles/labels 全面配置（role=button/dialog/gridcell）；焦点环使用 :focus-visible ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* **placement prop**：新增 `placement` 属性，支持 `'auto' | 'top' | 'bottom' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'`，默认根据视口空间自动决定方向 ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* **新增 emits**：`open`、`close`、`hover(color)` ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* **命令式 API**：`defineExpose` 暴露 `open()` / `close()` / `focus()` ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* **CSS Variables 主题化**：`--vcp-panel-bg`、`--vcp-focus-color`、`--vcp-swatch-size` 等 11 个变量，无需选择器穿透 ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* **pickerLabel**：`ColorPickerMessages` 新增 `pickerLabel` 字段，触发按钮 aria-label 更自然 ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))


### Bug Fixes

* HTML5 取色器改用 `@change` 代替 `@input`，修复 Chrome 拖动时持续触发导致颜色不更新及焦点抖动的问题（关闭 #37、#22）([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* `openPanel` 同步预应用锁定方向，消除首帧 bottom-left 闪烁 ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))
* `parseColor` / `rgbToHex` 健壮性加固：trim、lowercase、clamp、padStart，非法输入回退到 `#000000` ([02bac81](https://github.com/zuley/vue-color-picker/commit/02bac81))


### Performance

* 静态颜色数据（THEME_COLORS、STANDARD_COLORS、COLOR_PANEL）提升为模块作用域，每实例不再重复分配
* MutationObserver（监听 `<html lang>`）改为模块级单例 + 引用计数，多实例共享一个 observer
* resize/scroll 监听仅在面板打开时挂载，并通过 rAF 合并；完全锁定 placement 时跳过监听

# [2.1.0](https://github.com/zuley/vue-color-picker/compare/v2.0.1...v2.1.0) (2022-11-27)


### Features

* 🎸 使用examples作为示例目录 ([8172b6c](https://github.com/zuley/vue-color-picker/commit/8172b6c77690e0e72523dbb2643baffc666fac04))
* 🎸 修改入口文件引入examples ([69d233b](https://github.com/zuley/vue-color-picker/commit/69d233b4e436a9c34c81b939da6757aa4e56efc8))

## [2.0.1](https://github.com/zuley/vue-color-picker/compare/v1.1.0...v2.0.1) (2022-11-26)
