## 让 mock 变得简单

mock 有几种手段方法，有时候我们结合使用，如：

- 利用 webpack 的 devSever
- 启动 node 层的服务去 mock
- 利用 charles 代理
- 利用 chrome 插件去代理到 mock 服务
- 拦截请求

通常有这些原因阻碍了我们 mock 的脚步

- 有些 mock 使用起来**太麻烦**
- 有些工具**学习成本高**，有时配置不对用了**不生效**
- 有些工程不是用 webpackServer 调试，比如一些 **React-Native**、**小程序**的工程
- 移动端**真机**调试困难
- 多种工程 mock 多种 mock 方案，使用**体验不一致**
- 每个开发成员都要去配置环境来实现 mock

排除 mock 的痛苦，我这里分享一个 10 分钟就能搭建好一个通吃主流场景的方案，并且解除了几乎所有痛点

- 免去复杂的配置
- 没有任何依赖
- mock 数据在项目集中管理维护
- 即配置即生效
- 不影响打包体积
- 生产环境不受影响

## 方案原理

其实原理很简单，本质上还是请求拦截，没什么深奥的地方，但细节的处理技巧，让这个 mock 方案变得丝滑易用

虽然核心原理不是难点，但还是简单说一下吧

在不同工程我们可能用不同的请求，比如 `axios`、`fetch`、`wx.request`，并不是所有请求都有拦截器方法，因此最简单的就是**请求再封装**

事实上，几乎所有的项目都要对请求在封装，在其中做一些诸如：

- 根据环境填充 baseURL
- cookie / storage 搬运
- 异常情况弹窗
- **mock**

```js
import mockList from '../../mock'; // 引入写好的 mock 数据

// 封装 fetch，如果 url 命中 url 则直接返回 mock 数据
export default async function request(url) {
  const resArr = mockList.filter(item => item.url === url); 
  return resArr[0] || (await fetch(url).then(i => i.json()));
}
```

## 处理技巧

#### 引入 mock 数据的秘诀

我们会将整个 mock 文件夹下文件引入，作为 mock 数据集，比如，我们在 `mock/index.js` 下引入所有其他文件，并合并导出，如下图：

![](http://www.imaoda.com/i/20190823.6755a7d2.png)

但这样，带来的问题是一旦目录结构发生变化，比如新增，删除，批量调整，嵌套文件夹等，我们都需要频繁的修改 `mock/index.js` 文件，来确保全量引入了所有的 mock 数据

那么怎么才能方便的全量引入呢？

这时，有同学可能会说：用 `fs.readdirSync` 读取整个 mock 文件夹呀！

当然这个思路是对的，但是无法成行；因为毕竟这是前端工程，而非 node 工程，`fs.readdirSync` 是运行时处理的函数，而前端工程的运行时已经在浏览器端了，浏览器端拿来的 `fs`?

我们可以利用 [resolve.context](https://webpack.js.org/api/module-methods/#requirecontext) 来解决，该 API 不是 commonjs 语法，也不是 ES module 语法，而是由 `webpack` 提供的

`webpack` 在编译时，如果词法解析到该 api，会将这段代码放入 node 运行时去 `执行`，并将结果拼接到打包好的 `module` 中

#### 使用 `resolve.context` 进行批量引入

前面啰嗦了半天，我们正式开始使用 resolve.context 的语法套路比较固定，因此，如果觉得理解起来比较费解，那就死记吧，反正是固定套路

```ts
let routes = [] // 收集所有 mock 数据

// 遍历目录下 mock，开启递归遍历，匹配 (js|ts|jsx|tsx) 结尾的文件
const ctx = require.context('../../mock', true, /(js|ts|jsx|tsx)$/);

// 对命中的文件进行引入，用 cjs 语法引入 esm 导出的，需加 .default
ctx.keys().forEach((file) => {
    const content = ctx(file).default;
    if (content instanceof Array) {
        routes = [...routes, ...content];
    } else console.warn(`mock 文件${file}格式不是数组`);
});

// 导出所有
export default routes;
```

#### 通过调试命令开启 mock

如何开启、关闭 mock，方式有很多中，说一个比较通用的就是在调试命令里加入 `--mock` 参数，比如 `yarn dev --mock`

如何让请求感知到用户启动了 mock 呢？

答案是可以通过 webpack 的 definePlugin 进行注入

```js
// webpack 配置中，plugins 里增加：
new webpack.DefinePlugin({ __IS_MOCK__, process.argv.includes('--mock') }) // 简单起见就不用 minimist 解析参数了
```

此时，业务代码里已经注入了常量 `__IS_MOCK__` 他是个 boolean 值，代表了我们的调试命令里是否含 `--mock`

最后，我们再小改动一下之前封装的 request

```js
export default async function request(url) {
  // 如果未开启 mock 直接返回
  if(!__IS_MOCK__) return await fetch(url).then(i => i.json())
  
  const resArr = mockList.filter(item => item.url === url); 
  return resArr[0] || (await fetch(url).then(i => i.json()));
}
```

## 使用 mock 数据

以上两部，搭好 mock 之后，使用起来非常简单

1. 在 mock 文件夹下创建 mock 数据，如 

```js
// xx.js 文件
export default [
  { url: '/user/id', data: 10086, code: 0 },
  { url: '/user/name', data: 'wyf', code: 0 },
];
```

2. `yarn dev --mock` *(具体根据工程的命令，在 package.json 的 scripts 里新建)*

## 其他探讨点

至此，主要内容已经完成，如果还想在项目中继续优化探索，可以继续

#### 是否 gitignore mock 文件夹

ignore 之后，mock 文件夹不会被 git 仓库收录，也就是多人合作开发的时候，大家的 mock 文件互不干扰。

我个人理解：

- 适合 git 收录的场景：你的项目过于依赖 mock，比如后端环境经常挂，或者在浏览器环境没有宿主(如 app 会给 webview 带一些登陆 token 等)，导致无法联通后端
- 不适合 git 收录的场景：比如你的项目只要在增量开发的时候，个别后端没有 ready 的 api 需要 mock 时

值得注意的是，如果 ignore 掉了 mock 文件夹，`require.context` 会报错，此时加上 try catch，webpack 就会在找不到 mock 文件夹时跳过不处理，如：

```js
let routes = [] // 收集所有 mock 数据

try {
  const ctx = require.context('../../mock', true, /(js|ts|jsx|tsx)$/);
  /** 略 **/
} catch (e) {}

// 导出所有
export default routes;
```

#### 是否影响打包的包大小

如果工程 gitignore 了 mock 文件夹，上传的到 docker 构建的时候，是没有该文件夹的，因此不会影响到打包的体积

如果没有 ignore，且不做任何处理，很不幸的是，你的最终 bundle 会带上这些 mock 数据。解决方案就是在执行 `require.context` 前加入 if 条件，仅在 mock 打开的时候打包

#### 是否支持随机生成 mock 数据

这个方案是一个非常基础的工程方案，同时由于它没有过多依赖，所以非常灵活，你完全可以在拦截阶段，对获取的数据进行处理，比如自定义一些模板语法，比如可参考 Mock.js 的方案。

本方案的优势，在于灵活，不仅仅对 XHR 请求进行拦截，任意环境，比如小程序、fetch 等