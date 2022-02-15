/*
 * @Author: ShawnPhang
 * @Date: 2022-01-25 17:02:02
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-15 09:07:33
 * @site: book.palxp.com / blog.palxp.com
 */
const axios = require('axios')

const httpRequest = axios.create({
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

httpRequest.interceptors.response.use((config: any) => {
  return config.data
})

module.exports = httpRequest
