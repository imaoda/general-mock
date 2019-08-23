/**
 * 导出含 url 的数组，文件名随意(可读性好即可)
 * request.js 里自动将 mock 下的文件，进行数组合并
 * 即改即生效
 */

export default [
  {
    url: '/auth/code',
    data: '我是mock数据'
  },
  {
    url: '/auth/verify',
    data: '我是 verify 的 mock数据'
  },
]