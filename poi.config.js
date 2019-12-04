const path = require('path')
const isPro = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './develop/index',
  output: {
    dir: path.resolve(__dirname, 'docs'),
    publicUrl: isPro ? '/react-textclamp' : '/',
  },
  plugins: [
    {
      resolve: '@poi/plugin-typescript',
      options: {}
    }
  ],
  configureWebpack: {
    resolve: {
      extensions: ['.less']
    }
  }
}
