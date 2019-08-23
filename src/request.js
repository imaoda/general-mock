/**
|--------------------------------------------------
| 利用 require.context 读取 mock 文件夹下所有数据
|--------------------------------------------------
*/
let mockArr = [] // 收集所有 mock 数据

if(__IS_MOCK__) { // __IS_MOCK__ 由 webpack 注入，参考 vue.config.js 文件

  try { // try catch，避免不存在 mock 目录的异常情况

      // 遍历目录下 mock，开启递归遍历，匹配 (js|ts|jsx|tsx) 结尾的文件
      const ctx = require.context('../mock', true, /(js|ts|jsx|tsx)$/)

      // 对命中的文件进行引入，用 cjs 语法引入 esm 导出的，需加 .default
      ctx.keys().forEach((file) => {
          const content = ctx(file).default;
          if (content instanceof Array) {
              mockArr = [...mockArr, ...content];
          }
      })
      
  } catch (error) {}

}


/**
|--------------------------------------------------
| 简单示例一下拦截 fetch 请求并塞入 mock 数据
|--------------------------------------------------
*/
export default async function request(url) {
  // 无需 mock 的情形，直接走正常请求
  if(!__IS_MOCK__) return (await fetch(url).then(i => i.json()));

  // 需要 mock 的情形，如果命中，返回 mock 数据，否则正常请求
  const resArr = mockArr.filter(item => url.endsWith(item.url)); 
  return resArr[0] || (await fetch(url).then(i => i.json()));
}