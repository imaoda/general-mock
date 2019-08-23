const webpack = require('webpack')

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __IS_MOCK__: process.argv.includes('--mock') // 参考 package.json 中的 scripts 字段，解析到命令里带了 --mock，把注入的 __IS_MOCK__ 置为 true
      })
    ]
  }
}