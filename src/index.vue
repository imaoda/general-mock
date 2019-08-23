<template>
  <div id="app">
    <button @click="fetchData">点击请求网络数据</button>
    <p>
      网络数据：{{networkData}}
    </p>
  </div>
</template>

<script>
import request from './request'

export default {
  data: () => ({
    networkData: '暂无数据'
  }),
  methods: {
    async fetchData(){
      this.networkData = await request('https://bapi.imaoda.com/auth/verify')
    }
  }
}
</script>
