const path = require('path')
module.exports = {
  entry: './develop/index',
  output: {
    dir: path.resolve(__dirname, 'docs')
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
