const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,        // 添加端口配置（默认就是8080，可不写）
    proxy: {
      '/api': {
        target: 'http://localhost:1236',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': ''
        // }
      }
    },
    client: {
      overlay: false
    }
  }
})