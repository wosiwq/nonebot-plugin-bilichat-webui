<div align="center">
  <a href="https://v2.nonebot.dev/store"><img src="https://github.com/Well2333/nonebot-plugin-bilichat/blob/master/docs/nbp_logo.png?raw=true" width="180" height="180" alt="NoneBotPluginLogo"></a>
  <br>
</div>

<div align="center">

# nonebot-plugin-bilichat-webui

_✨ 多功能的 B 站视频解析工具的webui ✨_

<a href="./LICENSE">
    <img src="https://img.shields.io/github/license/wosiwq/nonebot-plugin-bilichat-webui.svg" alt="license">
</a>

<a href="https://github.com/psf/black">
    <img src="https://img.shields.io/badge/code%20style-black-000000.svg" alt="Code style: black">
</a>

<a href="https://jq.qq.com/?_wv=1027&k=5OFifDh">
  <img src="https://img.shields.io/badge/QQ%E7%BE%A4-768887710-orange?style=flat-square" alt="QQ Chat Group">
</a>
<a href="https://jq.qq.com/?_wv=1027&k=7LWx6q4J">
  <img src="https://img.shields.io/badge/QQ%E7%BE%A4-720053992-orange?style=flat-square" alt="QQ Chat Group">
</a>

</div>

## 📖 介绍

nonebot-plugin-bilichat-webui 是 nonebot-plugin-bilichat 配套的 WEB UI, 使用 vue3, element-plus, qrcode.vue 与 axios 开发。

## 💿 开发环境部署

1. 运行 `npm install` 安装开发环境依赖
2. 运行 `npx vite` 启动开发环境
3. (可选) 根据自己的需求修改 `vite.config.ts` 内的配置，如：`defineConfig` 内的 `server.proxy` 的 `target`。此处的 `target` 对应本地启动的 `nonebot-plugin-bilichat`的 api 地址，若未自定义 `bilichat_api_path` 则按照默认配置启动即可自动链接到 `nonebot-plugin-bilichat`

## 🎉 使用

WEB UI 将内置在 nonebot-plugin-bilichat 中，参考命令行内的提示即可正常使用

## ⏳ Star 趋势

[![Stargazers over time](https://starchart.cc/wosiwq/nonebot-plugin-bilichat-webui.svg)](https://starchart.cc/wosiwq/nonebot-plugin-bilichat-webui)
