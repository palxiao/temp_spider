/*
 * @Author: ShawnPhang
 * @Date: 2022-01-04 10:04:20
 * @Description: 图片素材爬取
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-26 10:24:38
 * @site: book.palxp.com / blog.palxp.com
 */
function fetch(url: string, params: any) {
  const axios = require('../../../utils/http.ts')
  return new Promise((resolve) => {
    axios.get(url).then((resp: any) => {
      resolve(resp)
    })
  })
}

module.exports = {
  getUnsplash(size: string | number = 10, oids: string[], search: string = 'material') {
    const page = 1
    const url = `https://unsplash.com/napi/search/photos?query=${search}&xp=&per_page=${size}&page=${page}`
    return new Promise(async (resolve) => {
      const res: any = await fetch(url)
      const data = res.results
      console.log('资源数: ' + res.total)
      const results: any = []
      for (const x of data) {
        if (!oids.includes(x.id.toString())) {
          results.push({
            // url: x.urls.full,
            url: x.urls.small,
            thumb: x.urls.thumb,
            original: x.id,
            width: x.width,
            height: x.height,
          })
        }
      }
      resolve(results)
    })
  },
  getbigeImages(size: string, oids: string[]) {
    const headers = {
      referer: 'https://bigesj.com/',
    }
    const downUpdateImage = require('./downUpdateImage.ts')
    // https://bigesj.com/new/design/backgrounds?cate_id=2&limit=24&page=1 // cate_id 2 渐变，3纹理材质 4自然风景
    const url = 'https://bigesj.com/new/design/backgrounds?cate_id=3&limit=24&page=1'
    return new Promise(async (resolve) => {
      const res: any = await fetch(url)
      const results: any = []
      for (const x of res.data.datalist) {
        if (!oids.includes(x.id.toString())) {
          const { url }: any = await downUpdateImage(x.coverimg, headers, 'bg')
          results.push({
            url,
            original: x.id,
            type: 11,
          })
        }
      }
      resolve(results)
    })
  },
}
