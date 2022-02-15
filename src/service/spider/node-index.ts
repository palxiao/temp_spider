/*
 * @Author: ShawnPhang
 * @Date: 2022-02-11 18:44:09
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-15 14:52:31
 * @site: book.palxp.com / blog.palxp.com
 */
const { spider: spiderConfig } = require('../../configs.ts')
let tempPage = spiderConfig.StartNumber
let maxPage = spiderConfig.EndNumber
let baseUrl = `http://localhost:${spiderConfig.port}/spider/temp?limit=1&page=`
let tempTimer: any = null
// const { setTemps2 } = require('./index.ts')

async function RunTemp(url: string, page: number) {
  tempPage++
  if (tempPage > maxPage + 1) {
    return
  }
  console.log(page)
  tempTimer = setTimeout(() => {
    console.log('任务超时，重新爬取中......')
    tempPage--
    RunTemp(baseUrl, tempPage)
  }, 30000)
  // setTemps2({limit: 1, page: tempPage})

  const axios = require('../../utils/http.ts')
  axios
    .get(url + page)
    .then((resp: any) => {
      console.log('采集完毕' + resp.msg)
      clearTimeout(tempTimer)
      tempTimer = null
      RunTemp(baseUrl, tempPage)
    })
    .catch((e: any) => {
      console.log(e)
    })
}

console.log('开始爬取数据...')
RunTemp(baseUrl, tempPage)
