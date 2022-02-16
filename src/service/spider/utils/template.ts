/*
 * @Author: ShawnPhang
 * @Date: 2022-01-04 09:17:49
 * @Description: 爬取模板/组件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-15 16:53:42
 * @site: book.palxp.com / blog.palxp.com
 */
const downUpdateImage = require('./downUpdateImage.ts')
let { image: imageDefault, text: textDefault, group: groupDefault, page: pageDefault, fontClass: fontDefault } = require('./Default-Data')

const http = require('../../../utils/http.ts')
const url = 'https://bigesj.com/new/design/groupRule/'
const listUrl = 'https://bigesj.com/new/design/groups?published=1'
const { spider: spiderData } = require('../../../configs.ts')
const tempParams = `?cate_id=${spiderData.cate_id}` // '?cate_id=6&industry_id=11&sort=click_nums+desc&limit=4&page=1'
const tempListUrl = 'https://bigesj.com/new/design/lists' + tempParams
const tempUrl = 'https://bigesj.com/new/design/info/'
const headers = {
  referer: 'https://bigesj.com/',
}

// const bigesj: any = {
//   url: 'https://bigesj.com/new/design/groupRule/',
//   listUrl: 'https://bigesj.com/new/design/groups?sub_cate_id=1&published=1&limit=',
//   tempParams: '?cate_id=3&limit=4&page=2', // '?cate_id=6&industry_id=11&sort=click_nums+desc&limit=4&page=1'
//   tempListUrl: 'https://bigesj.com/new/design/lists' + tempParams,
//   tempUrl: 'https://bigesj.com/new/design/info/',
//   headers: {
//     referer: 'https://bigesj.com/',
//   },
// }
const gaoding: any = {
  url: '',
  listUrl: 'https://www.gaoding.com/api/open/editor/gd_web/editor/material?platforms=0&channels=1&filter_id=1609221%2C1614415&q=&region_id=1&biz_code=1&endpoint=4&page_size=30&page_num=4',
  tempListUrl: 'https://www.gaoding.com/api/open/editor/gd_web/editor/sim_search?channel_category_id=370&region_id=1&biz_code=1&endpoint=4' + '&page_num=1&page_size=6',
  tempUrl: 'https://www.gaoding.com/api/v2/materials/', // /info
  headers: {
    referer: 'https://www.gaoding.com/',
  },
}

async function addComponents(arr: any = []) {
  let collecter: any = []
  return new Promise(async (resolve: any) => {
    for (let i = 0; i < arr.length; i++) {
      let checkComplete = true
      const element = arr[i]
      let { name, type, url: imgUrl = '', color, content: text, fontSize, width, height, left, top, letterSpacing, lineHeight, opacity, textAlign, fontFamily, fontWeight, writingMode, textDecoration, rotate } = element
      let defaultData: any = JSON.parse(JSON.stringify(imageDefault))
      let uploadRes: any = null

      if (type === 'text') {
        defaultData = JSON.parse(JSON.stringify(textDefault))
      } else if (type === 'svg' || type === 'image' || type === 'mask') {
        if (name === '二维码') {
          imgUrl = 'https://rmt-design-dev.imp360.cn/d/data/images/local/c2f3f57c2069a6e3.png'
        } else {
          if (imgUrl) {
            try {
              uploadRes = await downUpdateImage(imgUrl, headers, 'comp')
            } catch (e) {}
          }
        }
        if (!imgUrl) {
          throwErrorInfo('缺少图片素材: ' + type, element, type)
          checkComplete = false
        }
      } else if (element.isGroup && type === 'com') {
        // 比格组合元素
        try {
          const { collecter: childComps }: any = await addComponents(element.children) // 添加子组件
          collecter = collecter.concat(childComps)
        } catch (error) {
          console.log('添加子组件出错', error)
        }
        // collecter.push(Object.assign(groupDefault, { width, height, left, top, opacity })) // 塞入组合组件（有问题，因实现方式不同，缺少定位父级id的逻辑）
      } else if (element.groupable && type === 'group') {
        // 稿定组合元素
        const { collecter: childComps }: any = await addComponents(element.elements) // 添加子组件
        collecter = collecter.concat(childComps)
      } else {
        throwErrorInfo('存在未知类型: ' + type, element, type)
      }

      checkComplete &&
        collecter.push(
          Object.assign(defaultData, {
            text: text
              ? encodeURIComponent(
                  text
                    .replace('成都', '广州')
                    .replace('YOUR LOGO', 'ZAKER')
                    .replace('比格', '小云')
                    .replace('比小格', '云设计')
                    .replace('bigesj.com', 'zaker.cn')
                    .replace(/^\s+|\s+$/g, '')
                )
              : text,
            fontSize,
            width: +width + 1,
            height: height,
            left,
            top,
            letterSpacing: (letterSpacing * 100) / fontSize, // 此属性设计方式不同所以转换下
            lineHeight,
            opacity,
            textAlign,
            imgUrl: uploadRes ? uploadRes.url : imgUrl,
            color: color || defaultData.color,
            fontFamily: fontFamily ? fontFamily.split(' ').join('') : fontFamily,
            fontWeight,
            writingMode,
            textDecoration,
            rotate: rotate ? rotate + 'deg' : rotate,
          })
        )
    }
    // return { collecter, resKeyCollecter }
    resolve({ collecter })
  })
}

function throwErrorInfo(text: string, data: any, type: any) {
  const fs = require('fs')
  const path = require('path')
  console.error(text + ' --> 日志已生成 ')
  fs.writeFile(path.resolve(__dirname, `${type}-${Math.random()}.json`), JSON.stringify(data), (e: any) => {})
}

module.exports = {
  getComponent(CompId: string = '0') {
    return new Promise((resolve) => {
      http.get(url + CompId).then(async (resp: any) => {
        let data = null
        let layouts = null
        let pass = true
        try {
          data = resp.data
          layouts = data.content.layouts[0]
        } catch (error) {
          console.log(data.content)
          pass = false
        }
        if (!pass) {
          return
        }
        // 添加各种组件
        const { collecter }: any = await addComponents(layouts.elements)
        // 塞入默认组件
        collecter.push(
          Object.assign(groupDefault, {
            width: layouts.width,
            height: layouts.height,
          })
        )
        resolve(collecter)
      })
    })
  },
  getTemplate(tempId: string = '0') {
    return new Promise((resolve) => {
      console.log(`! 开始获取模板: ${tempId}`)
      http.get(tempUrl + tempId).then(async (resp: any) => {
        let data = null
        let layouts = null
        let pass = true
        let title = ''
        let tags = ''
        try {
          data = JSON.parse(resp.data.content)
          tags = resp.data.tag
          title = resp.data.name
          layouts = data.layouts[0]
        } catch (error) {
          console.log(data)
          pass = false
        }
        if (!pass) {
          return
        }

        const result: any = {}
        try {
          const { backgroundColor, backgroundUrl, imageTransform: backgroundTransform, width, height } = layouts
          const { collecter }: any = await addComponents(layouts.elements)
          result.widgets = collecter

          let backgroundImage = ''
          if (backgroundUrl) {
            const { url, key }: any = await downUpdateImage(backgroundUrl, headers, 'cover')
            backgroundImage = url
          }
          const defaultData = JSON.parse(JSON.stringify(pageDefault))
          result.page = Object.assign(defaultData, { backgroundColor, backgroundImage, backgroundTransform, width, height })
          result.title = title
          result.tags = tags
        } catch (e) {
          console.log('添加组件出现问题：', e)
        }
        resolve(result)
      })
    })
  },
  getCompList(params: any = {}, oids: string[] = []) {
    params = Object.assign({ limit: 1, page: 1 }, params) // &limit=5&page=1
    let url_params = ''
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        url_params += `&${key}=${params[key]}`
      }
    }
    return new Promise(async (resolve) => {
      http.get(listUrl + url_params).then(async (resp: any) => {
        const datalist = resp.data.datalist
        const result: any = []
        for (let i = 0; i < datalist.length; i++) {
          if (!oids.includes(datalist[i].id.toString())) {
            const uploadRes: any = await downUpdateImage(datalist[i].coverimg, headers, 'cover')
            result.push({ id: datalist[i].id, cover: uploadRes.url })
          }
        }
        resolve(result)
      })
    })
  },
  getTempList(params: any = {}, oids: string[] = []) {
    params = Object.assign({ limit: 1, page: 1 }, params) // &limit=5&page=1
    let url_params = ''
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        url_params += `&${key}=${params[key]}`
      }
    }
    console.log(`! 采集第 ${params.page} 页`)
    return new Promise(async (resolve) => {
      http.get(tempListUrl + url_params).then(async (resp: any) => {
        const datalist = resp.data.datalist
        const result: any = []
        for (let i = 0; i < datalist.length; i++) {
          if (!oids.includes(datalist[i].id.toString()) && datalist[i].coverimg.indexOf('.gif') === -1) {
            // 暂不支持gif，所以过滤掉
            const { url: cover }: any = await downUpdateImage(datalist[i].coverimg, headers, 'cover')
            result.push({ id: datalist[i].id, cover })
          }
        }
        resolve(result)
      })
    })
  },
  // getTemplateGaoding(tempId: string = '0') {
  //   return new Promise((resolve) => {
  //     http.get(gaoding.tempUrl + tempId + '/info').then(async (resp: any) => {
  //       let data = null
  //       let layouts = null
  //       let elements = []
  //       let pass = true
  //       try {
  //         data = JSON.parse(resp.content)
  //         // throwErrorInfo('调试 ', resp.content, 'data')
  //         layouts = data.layout
  //         elements = data.model.elements
  //       } catch (error) {
  //         console.log(data)
  //         pass = false
  //       }
  //       if (!pass) {
  //         return
  //       }
  //       const { backgroundColor, backgroundImage: backgroundUrl, width, height } = layouts
  //       let backgroundImage = ''
  //       if (backgroundUrl) {
  //         const { url }: any = await downUpdateImage(backgroundUrl, headers, 'cover')
  //         backgroundImage = url
  //       }
  //       const defaultData = JSON.parse(JSON.stringify(pageDefault))
  //       const result: any = {}
  //       result.page = Object.assign(defaultData, { backgroundColor, backgroundImage, width, height })
  //       result.widgets = await addComponents(elements)
  //       resolve(result)
  //     })
  //   })
  // },
  getComponentGaoding(CompId: string = '0') {
    return new Promise((resolve) => {
      http.get(gaoding.tempUrl + CompId + '/info').then(async (resp: any) => {
        let pass = true
        let layouts = null
        try {
          const data = JSON.parse(resp.content)
          layouts = data.model
        } catch (error) {
          console.log(resp)
          pass = false
        }
        if (!pass) {
          return
        }
        // 添加各种组件
        const { collecter }: any = await addComponents(layouts.elements)
        // 塞入默认组件
        collecter.push(
          Object.assign(groupDefault, {
            width: layouts.width,
            height: layouts.height,
          })
        )
        resolve(collecter)
      })
    })
  },
  getTempListGaoding(params: any, oids: string[] = []) {
    return new Promise(async (resolve) => {
      http.get(gaoding.listUrl).then(async (resp: any) => {
        const datalist = resp
        const result: any = []
        for (let i = 0; i < datalist.length; i++) {
          if (!oids.includes(datalist[i].id.toString())) {
            const { url: cover }: any = await downUpdateImage(datalist[i].preview.url, gaoding.headers, 'cover')
            result.push({ id: datalist[i].id, cover })
          }
        }
        resolve(result)
      })
    })
  },
}
