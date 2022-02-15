/*
 * @Author: ShawnPhang
 * @Date: 2022-01-06 11:50:34
 * @Description: 测试
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-27 09:37:26
 * @site: book.palxp.com / blog.palxp.com
 */
function Test(CompId) {
  // const url = `https://www.gaoding.com/api/v2/materials/${CompId}/info`
  const url = `https://bigesj.com/new/design/info/${CompId}`
  // const url = 'https://www.gaoding.com/api/open/editor/gd_web/editor/sim_search?page_num=1&page_size=20&channel_category_id=370&region_id=1&biz_code=1&endpoint=4'
  const fs = require('fs')
  const path = require('path')
  const axios = require('axios')
  return new Promise((resolve) => {
    axios.get(url).then(async (resp) => {
      let data = null
      let pass = false
      // let list = []
      let content = []
      try {
        data = resp.data.data
        // list = data.map(({ id, title }: any) => {
        //   return { id, title }
        // })
        content = data.content
        pass = true
      } catch (error) {
        console.log(data)
      }
      if (!pass) {
        return
      }
      // const collecter: any = list
      // const collecter = content
      // resolve(collecter)
      // ----- TEST -----
      // console.log(JSON.stringify(collecter))
      // fs.writeFile(path.resolve(__dirname, 'data.json'), JSON.stringify(collecter), (err: any) => {
      //   if (err) throw err
      // })
      fs.writeFile(path.resolve(__dirname, 'data.json'), content, (err) => {
        if (err) throw err
      })
    })
  })
}

Test('28057')