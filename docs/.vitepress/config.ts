import { defineConfig, type HeadConfig } from 'vitepress'
import path from 'path'

const SITE_URL = 'https://vue-color-picker.rxshc.com'
const SITE_ICON = `${SITE_URL}/favicon.svg`
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`
const ENGLISH_FAQ = [
  {
    question: 'Does vColorPicker support Vue 3?',
    answer: 'Yes. vColorPicker is built for Vue 3 projects and works with standard v-model usage.'
  },
  {
    question: 'Can I customize the panel text or change the language?',
    answer: 'Yes. You can set the locale prop to zh-CN or en-US, and you can override built-in labels with the messages prop.'
  },
  {
    question: 'Does the color picker work with TypeScript?',
    answer: 'Yes. The package includes TypeScript declarations for the component props and plugin usage.'
  },
  {
    question: 'Does it support native browser color picking?',
    answer: 'Yes. The More Colors action uses the native HTML5 color input when the browser supports it.'
  }
] as const
const CHINESE_FAQ = [
  {
    question: 'vColorPicker 支持 Vue 3 吗？',
    answer: '支持。vColorPicker 面向 Vue 3 项目设计，使用标准的 v-model 方式即可接入。'
  },
  {
    question: '可以切换中英文或者自定义面板文案吗？',
    answer: '可以。你可以通过 locale 设置 zh-CN 或 en-US，也可以通过 messages 覆盖默认文案。'
  },
  {
    question: '这个组件支持 TypeScript 吗？',
    answer: '支持。当前包已经提供组件属性和插件注册的 TypeScript 类型声明。'
  },
  {
    question: '是否支持浏览器原生取色器？',
    answer: '支持。点击更多颜色时，会在兼容浏览器中调用 HTML5 原生 color input。'
  }
] as const

const getCanonicalPath = (relativePath: string) => {
  const routePath = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '.html')

  if (!routePath || routePath === '/') {
    return '/'
  }

  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

const getAlternateLinks = (canonicalPath: string): HeadConfig[] => {
  const isChinesePage = canonicalPath.startsWith('/zh/')
  const englishUrl = `${SITE_URL}/`
  const chineseUrl = `${SITE_URL}/zh/`

  if (canonicalPath === '/' || canonicalPath === '/zh/') {
    return [
      ['link', { rel: 'alternate', hreflang: 'en', href: englishUrl }],
      ['link', { rel: 'alternate', hreflang: 'zh-CN', href: chineseUrl }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: englishUrl }]
    ]
  }

  return [
    ['link', { rel: 'alternate', hreflang: isChinesePage ? 'zh-CN' : 'en', href: `${SITE_URL}${canonicalPath}` }]
  ]
}

const getStructuredData = (canonicalPath: string, title: string, description: string): HeadConfig[] => {
  if (canonicalPath !== '/' && canonicalPath !== '/zh/') {
    return []
  }

  const isChinesePage = canonicalPath === '/zh/'
  const faqEntries = isChinesePage ? CHINESE_FAQ : ENGLISH_FAQ
  const pageUrl = `${SITE_URL}${canonicalPath}`
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      url: SITE_URL,
      inLanguage: isChinesePage ? 'zh-CN' : 'en'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'vColorPicker',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description,
      url: pageUrl,
      image: DEFAULT_OG_IMAGE
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    }
  ]

  return [
    ['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)]
  ]
}

export default defineConfig({
  lang: 'en',
  title: 'vColorPicker',
  description: 'A color picker component for Vue 3',
  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'author', content: 'zuley' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['meta', { property: 'og:site_name', content: 'vColorPicker' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'vColorPicker',
      description: 'A color picker component for Vue 3',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'GitHub', link: 'https://github.com/zuley/vue-color-picker' }
        ],
        footer: {
          message: 'Author: <a href="https://rxshc.com/" target="_blank" rel="noreferrer">rxshc.com</a>'
        },
        outline: {
          label: 'On this page'
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'vColorPicker',
      description: '基于 Vue3 的颜色选择器组件',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'GitHub', link: 'https://github.com/zuley/vue-color-picker' }
        ],
        footer: {
          message: '作者：<a href="https://rxshc.com/" target="_blank" rel="noreferrer">rxshc.com</a>'
        },
        outline: {
          label: '页面导航'
        }
      }
    }
  },

  sitemap: {
    hostname: SITE_URL,
    transformItems(items) {
      return items
        .filter(item => !item.url.endsWith('/404.html'))
        .map(item => {
          if (item.url === `${SITE_URL}/` || item.url === `${SITE_URL}/zh/`) {
            return {
              ...item,
              links: [
                { lang: 'en', hreflang: 'en', url: `${SITE_URL}/` },
                { lang: 'zh-CN', hreflang: 'zh-CN', url: `${SITE_URL}/zh/` }
              ]
            }
          }

          return item
        })
    }
  },

  transformHead({ pageData, title, description }): HeadConfig[] {
    const canonicalPath = getCanonicalPath(pageData.relativePath)
    const canonicalUrl = `${SITE_URL}${canonicalPath}`
    const isChinesePage = canonicalPath.startsWith('/zh/')
    const keywords = isChinesePage
      ? 'Vue3 颜色选择器, Vue color picker, vColorPicker, 前端组件'
      : 'Vue 3 color picker, Vue color picker component, vColorPicker, frontend UI component'

    return [
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { name: 'keywords', content: keywords }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:image', content: DEFAULT_OG_IMAGE }],
      ['meta', { property: 'og:image:alt', content: 'vColorPicker preview image' }],
      ['meta', { property: 'og:locale', content: isChinesePage ? 'zh_CN' : 'en_US' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: DEFAULT_OG_IMAGE }],
      ['meta', { name: 'twitter:image:alt', content: 'vColorPicker preview image' }],
      ['meta', { name: 'msapplication-TileImage', content: SITE_ICON }],
      ...getAlternateLinks(canonicalPath),
      ...getStructuredData(canonicalPath, title, description)
    ]
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zuley/vue-color-picker' }
    ]
  },

  vite: {
    resolve: {
      alias: {
        'vcolorpicker': path.resolve(__dirname, '../../packages/main.ts')
      }
    }
  }
})
