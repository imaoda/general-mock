## 简介

5分钟搭建一个简单易用通吃主流场景的 mock，支持 xhr fetch 小程序 rn 等场景的 mock，并且可自定义扩展能力

## 目录结构

工程非常简单，目的是为了方便理解

- 入口文件 src/main.js
- 页面只有一个 src/index.vue
- webpack 配置在 vue.config.js，只有一个 definePlugin
- 请求拦截&mock数据加载在 request 中
- package.json 中新增一个 命令 `yarn mock` (或者 `npm run mock`) 用于启动 mock 调试

## 开始使用

1. `yarn` 或者 `npm i`
2. 在 mock 文件夹下加入 mock 数据
3. `yarn mock` 或者 `npm run mock`  启动调试

## 相关文章

[相关文章](https://github.com/imaoda/js-front-end-practice/blob/master/0%E4%BE%9D%E8%B5%96100%E8%A1%8C%E4%BB%A3%E7%A0%81%E4%B8%BA%E9%A1%B9%E7%9B%AE%E6%B7%BB%E5%8A%A0mock.md)