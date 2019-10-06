import { css } from 'docz-plugin-css'
export default {
  base: '/react-clamp/',
  title: 'react-clamp',
  description: 'react text clamp component',
  dest: 'website',
  typescript: true,
  // src: './doc',
  protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  themeConfig: {
    mode: 'light'
  },
  hashRouter: true,
  plugins: [
    css({
      preprocessor: 'less'
    })
  ],
  codeSandbox: false
}
