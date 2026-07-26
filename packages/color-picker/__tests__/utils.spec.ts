import { describe, expect, it } from 'vitest'
import {
  COLOR_PANEL,
  GRADIENT_STEPS,
  STANDARD_COLORS,
  THEME_COLORS,
  clamp,
  gradient,
  hexToRgb,
  normalizeLocale,
  parseColor,
  parsePlacement,
  rgbToHex
} from '../src/utils'

describe('parseColor', () => {
  it('接受标准 6 位 hex', () => {
    expect(parseColor('#1e497b')).toBe('#1e497b')
  })

  it('大写与空白被规范化', () => {
    expect(parseColor('  #FF00AA ')).toBe('#ff00aa')
  })

  it('展开 3 位缩写', () => {
    expect(parseColor('#abc')).toBe('#aabbcc')
  })

  it('自动补全缺失的 # 前缀', () => {
    expect(parseColor('ff0000')).toBe('#ff0000')
  })

  it('非法输入回退到黑色', () => {
    expect(parseColor('')).toBe('#000000')
    expect(parseColor('not-a-color')).toBe('#000000')
    expect(parseColor('#12345')).toBe('#000000')
    expect(parseColor('#gggggg')).toBe('#000000')
  })
})

describe('hexToRgb / rgbToHex', () => {
  it('互为往返', () => {
    expect(rgbToHex(...hexToRgb('#4e81bb'))).toBe('#4e81bb')
  })

  it('rgbToHex 对越界分量做钳制', () => {
    expect(rgbToHex(-10, 300, 128)).toBe('#00ff80')
  })
})

describe('clamp', () => {
  it('限制在区间内', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('gradient', () => {
  it('生成指定步数并以起点开头', () => {
    const out = gradient('#000000', '#ffffff', 5)
    expect(out).toHaveLength(5)
    expect(out[0]).toBe('#000000')
  })

  it('单调渐变到接近终点', () => {
    const out = gradient('#000000', '#ffffff', 5)
    const [r] = hexToRgb(out[4])
    expect(r).toBeGreaterThan(150)
  })
})

describe('COLOR_PANEL 预计算', () => {
  it('10 列，每列 GRADIENT_STEPS 行', () => {
    expect(COLOR_PANEL).toHaveLength(10)
    for (const col of COLOR_PANEL) expect(col).toHaveLength(GRADIENT_STEPS)
  })

  it('全部为合法 hex', () => {
    for (const col of COLOR_PANEL) {
      for (const color of col) expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

describe('normalizeLocale', () => {
  it('空值回退 zh-CN', () => {
    expect(normalizeLocale()).toBe('zh-CN')
    expect(normalizeLocale('')).toBe('zh-CN')
  })

  it('按前缀匹配', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-CN')
    expect(normalizeLocale('ja')).toBe('ja-JP')
    expect(normalizeLocale('en-GB')).toBe('en-US')
    expect(normalizeLocale('fr-FR')).toBe('en-US')
  })
})

describe('parsePlacement', () => {
  it('auto 时两轴均为 auto', () => {
    expect(parsePlacement('auto')).toEqual({ vertical: 'auto', horizontal: 'auto' })
  })

  it('只给垂直方向时水平为 auto', () => {
    expect(parsePlacement('top')).toEqual({ vertical: 'top', horizontal: 'auto' })
  })

  it('start/end 映射为 left/right', () => {
    expect(parsePlacement('bottom-start')).toEqual({ vertical: 'bottom', horizontal: 'left' })
    expect(parsePlacement('top-end')).toEqual({ vertical: 'top', horizontal: 'right' })
  })
})

describe('色板常量', () => {
  it('主题色与标准色各 10 个', () => {
    expect(THEME_COLORS).toHaveLength(10)
    expect(STANDARD_COLORS).toHaveLength(10)
  })
})
