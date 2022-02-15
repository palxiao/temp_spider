/*
 * @Author: ShawnPhang
 * @Date: 2022-01-05 10:48:38
 * @Description: 七牛入库
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-15 14:38:12
 * @site: book.palxp.com / blog.palxp.com
 */
module.exports = function downUpdateImage(imgUrl: string, headers: Headers, prefix: string = 'cache') {
  const axios = require('../../../utils/http.ts')

  return new Promise(async (resolve, reject) => {
    if (imgUrl.indexOf('http://') !== 0 && imgUrl.indexOf('https://') !== 0) {
      resolve({ url: '' })
      return
    }
    const resp = await axios.get(imgUrl, {
      headers,
      responseType: 'arraybuffer',
    })
    let result: any = {}
    let imgName = imgUrl.split('?')[0].split('/').pop()
    ;(imgName?.split('.') || []).length <= 1 && (imgName += '.png')
    console.log('资源入库:', imgName, '类型:', prefix)
    const strBuffer = Buffer.from(resp, 'utf-8')
    // const { data }: any = await serverUploader(strBuffer)
    serverUploader(strBuffer)
      .then(({ data }: any) => {
        result.url = data.preview_url
        resolve(result)
      })
      .catch((e) => {
        result.url = ''
        resolve(result)
      })
  })
}

function serverUploader(buffer: Buffer) {
  const URL = 'https://rmt-design-dev.imp360.cn/api/upload/upload_image_base64'
  const axios = require('../../../utils/http.ts')
  return new Promise((resolve, reject) => {
    axios
      .post(URL, {
        file: 'data:image/png;base64,' + buffer.toString('base64'),
      })
      .then((resp: any) => {
        resolve(resp)
      })
      .catch((e: any) => {
        // console.log('图片上传出错')
        // throwErrorInfoImageUpload('上传错误 ', e, 'imageUploadError')
        reject(e)
      })
  })
}

function throwErrorInfoImageUpload(text: string, data: any, type: any) {
  const fs = require('fs')
  const path = require('path')
  console.error(text + ' --> 日志已生成 ')
  fs.writeFile(path.resolve(__dirname, `${type}-${Math.random()}.json`), JSON.stringify(data), (e: any) => {})
}
