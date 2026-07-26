import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import colorPicker from '../src/index.vue'

let wrapper: VueWrapper | null = null

const mountPicker = (props: Record<string, unknown> = {}) => {
  wrapper = mount(colorPicker, {
    props: { modelValue: '#ff0000', ...props },
    attachTo: document.body
  })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
})

describe('colorPicker 基础渲染', () => {
  it('触发器显示当前颜色', () => {
    const w = mountPicker()
    const btn = w.get('.colorBtn')
    expect(btn.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('modelValue 为空时显示 defaultColor', () => {
    const w = mountPicker({ modelValue: '', defaultColor: '#00ff00' })
    expect(w.get('.colorBtn').attributes('style')).toContain('rgb(0, 255, 0)')
  })

  it('locale 为 en-US 时渲染英文文案', () => {
    const w = mountPicker({ locale: 'en-US' })
    expect(w.get('.defaultColor').text()).toBe('Default')
    expect(w.text()).toContain('Theme Colors')
  })
})

describe('面板开关', () => {
  it('点击触发器打开面板并触发 open 事件', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    expect(w.get('.box').classes()).toContain('open')
    expect(w.emitted('open')).toHaveLength(1)
  })

  it('disabled 时点击不打开', async () => {
    const w = mountPicker({ disabled: true })
    await w.get('.colorBtn').trigger('click')
    expect(w.get('.box').classes()).not.toContain('open')
    expect(w.emitted('open')).toBeUndefined()
  })

  it('面板内按 Escape 关闭并触发 close 事件', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('.box').trigger('keydown', { key: 'Escape' })
    expect(w.get('.box').classes()).not.toContain('open')
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('点击组件外部关闭面板', async () => {
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(w.get('.box').classes()).not.toContain('open')
  })

  it('键盘 Enter 可切换面板', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('keydown', { key: 'Enter' })
    expect(w.get('.box').classes()).toContain('open')
    await w.get('.colorBtn').trigger('keydown', { key: 'Enter' })
    expect(w.get('.box').classes()).not.toContain('open')
  })
})

describe('颜色选取', () => {
  it('点击主题色 emit update:modelValue 与 change 并关闭面板', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-0"]').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['#000000']])
    expect(w.emitted('change')).toEqual([['#000000']])
    expect(w.get('.box').classes()).not.toContain('open')
  })

  it('点击默认颜色恢复 defaultColor', async () => {
    const w = mountPicker({ defaultColor: '#123456' })
    await w.get('.colorBtn').trigger('click')
    await w.get('.defaultColor').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['#123456']])
  })

  it('hover 色块 emit hover 事件', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-1"]').trigger('mouseover')
    expect(w.emitted('hover')?.[0]).toEqual(['#ffffff'])
  })
})

describe('色块网格键盘导航', () => {
  it('初始只有第一个色块可 Tab 进入（roving tabindex）', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    expect(w.get('[data-cell="0-0"]').attributes('tabindex')).toBe('0')
    expect(w.get('[data-cell="0-1"]').attributes('tabindex')).toBe('-1')
  })

  it('ArrowRight 将漫游焦点移到下一格', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-0"]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(w.get('[data-cell="0-1"]').attributes('tabindex')).toBe('0')
    expect(w.get('[data-cell="0-0"]').attributes('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(w.get('[data-cell="0-1"]').element)
  })

  it('ArrowDown 从主题色行进入渐变面板行', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-0"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(w.get('[data-cell="1-0"]').attributes('tabindex')).toBe('0')
  })

  it('End 跳到行尾，边界不越界', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-0"]').trigger('keydown', { key: 'End' })
    await nextTick()
    expect(w.get('[data-cell="0-9"]').attributes('tabindex')).toBe('0')
    await w.get('[data-cell="0-9"]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(w.get('[data-cell="0-9"]').attributes('tabindex')).toBe('0')
  })

  it('Enter 选中当前色块', async () => {
    const w = mountPicker()
    await w.get('.colorBtn').trigger('click')
    await w.get('[data-cell="0-0"]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await w.get('[data-cell="0-1"]').trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')).toEqual([['#ffffff']])
  })
})

describe('teleport', () => {
  it('teleport: true 时面板渲染到 body 下', async () => {
    const w = mountPicker({ teleport: true })
    // 面板不在组件根元素内部
    expect(w.element.querySelector('.m-colorPicker-box')).toBeNull()
    const panel = document.body.querySelector('.m-colorPicker-box')
    expect(panel).not.toBeNull()
    expect(panel!.parentElement).toBe(document.body)
    await w.get('.colorBtn').trigger('click')
    await nextTick()
    expect(panel!.classList.contains('open')).toBe(true)
    // fixed 定位由内联样式接管
    expect((panel as HTMLElement).style.position).toBe('fixed')
  })

  it('teleport 面板内点击不会被误判为外部点击', async () => {
    const w = mountPicker({ teleport: true })
    await w.get('.colorBtn').trigger('click')
    const panel = document.body.querySelector('.m-colorPicker-box') as HTMLElement
    panel.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(panel.classList.contains('open')).toBe(true)
  })
})
