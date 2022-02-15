/*
 * @Author: ShawnPhang
 * @Date: 2020-09-04 22:01:45
 * @Description: 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-12 17:16:06
 * @site: book.palxp.com / blog.palxp.com
 */
const rExpress = require('express')
const spiderService = require('../service/spider/index.ts')
const api = require('./api.ts')

const rRouter = rExpress.Router()


rRouter.get(api.GRAB_TEMP, spiderService.setTemps)
rRouter.get(api.GRAB_COMP, spiderService.setComps)
rRouter.get(api.PROXY_GET, spiderService.proxyGet)


module.exports = rRouter

export default rRouter
