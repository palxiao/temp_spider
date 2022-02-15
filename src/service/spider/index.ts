/*
 * @Author: ShawnPhang
 * @Date: 2021-12-31 11:09:30
 * @Description: Type: 0 模板，1 文字组件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-14 17:53:24
 * @site: book.palxp.com / blog.palxp.com
 */
// const func = require('../../utils/mysql.ts')
const { getComponent, getTempList, getTemplate, getCompList, getTempListGaoding, getComponentGaoding } = require('./utils/template.ts')
const { getUnsplash, getbigeImages } = require('./utils/images.ts')
const http = require('../../utils/http.ts')

async function spiderTempFormal(apiType: string | number, params: any) {
  const URL = 'https://rmt-design-dev.imp360.cn' + (apiType == 1 ? '/api/material/text_tpl_save' : '/api/template/temp_save')
  const list = apiType == 0 ? await getTempList(params, []) : await getCompList(params, [])
  for (let i = 0; i < list.length; i++) {
    const collecter = apiType == 0 ? await getTemplate(list[i].id) : await getComponent(list[i].id)
    const { spider: spiderData } = require('../../configs.ts')
    const params = {
      image_url: list[i].cover,
      content: JSON.stringify(collecter),
      // scene_types: [8],
      material_types: spiderData.material_types, 
      source: 'bige',
      source_id: list[i].id,
      title: collecter.title,
      tags: collecter.tags
    }
    http
      .post(URL, params, {
        headers: { Authorization: `Bearer eyJpdiI6InlnUU1TTGh2OFwvU0xzTjNhSEhiWDhnPT0iLCJ2YWx1ZSI6ImhNaXpkaTAyZFdvYXFOd0lBbjRWMWorS3J3UXBFUUtqcnFJdW9YbEJVdHhPSmZTOEdISUUycVoxTHZicmg0bjhkbzVWaDdDRFhmTGdJa1Y2ZXczQmRZSExDSzR1N2R0c0pMdXZydmNuRHRKTTN1ckh3QjB3aVQ5eTFLWFdTYWo4dytaQWhvbmdoZ1FOd2VPN2dwODcrZnBcLzR2SThIYURHR3c2dEVkMHZRXC9hT0lvSXhiTmNzRnVmMVRNY1dTc3FudjJORnFTemVqOUI2VHFxcW1EWjZnT0ppa1dtb0dkZlJXaTl3Mm5JeEtueld0aFJpOGRiXC9ockNBRWMrMXIrQXBvR05CQWcyT3hIY0EyVTQxbTdCVXhRPT0iLCJtYWMiOiJmOTdjZGE2NjMxMGM2MDdhMDE1YzQ5ZWJkZWM3NmQ4YjMyZjRjMzc1ZTFmMzJkYjIxNmU1M2M1YmNhMWY4NTY2In0=` },
      })
      .then((resp: any) => {
        // resolve(resp.data)
        console.log(resp.data)
      })
      .catch((e: any) => {
        console.log(e)
      })
  }
}
async function spiderTempGaodingFormal(setType: string | number = 0, num: number = 0) {
  const URL = 'https://rmt-design-dev.imp360.cn/api/template/temp_save'
  const list = await getTempListGaoding(num, [])
  for (let i = 0; i < list.length; i++) {
    // const collecter = await getTemplateGaoding(list[i].id)
    // const params = {
    //   image_url: list[i].cover,
    //   content: JSON.stringify(collecter),
    //   // scene_types: [8, 10],
    //   // material_types
    // }
    // http
    //   .post(URL, params, {
    //     headers: { Authorization: `Bearer eyJpdiI6InlnUU1TTGh2OFwvU0xzTjNhSEhiWDhnPT0iLCJ2YWx1ZSI6ImhNaXpkaTAyZFdvYXFOd0lBbjRWMWorS3J3UXBFUUtqcnFJdW9YbEJVdHhPSmZTOEdISUUycVoxTHZicmg0bjhkbzVWaDdDRFhmTGdJa1Y2ZXczQmRZSExDSzR1N2R0c0pMdXZydmNuRHRKTTN1ckh3QjB3aVQ5eTFLWFdTYWo4dytaQWhvbmdoZ1FOd2VPN2dwODcrZnBcLzR2SThIYURHR3c2dEVkMHZRXC9hT0lvSXhiTmNzRnVmMVRNY1dTc3FudjJORnFTemVqOUI2VHFxcW1EWjZnT0ppa1dtb0dkZlJXaTl3Mm5JeEtueld0aFJpOGRiXC9ockNBRWMrMXIrQXBvR05CQWcyT3hIY0EyVTQxbTdCVXhRPT0iLCJtYWMiOiJmOTdjZGE2NjMxMGM2MDdhMDE1YzQ5ZWJkZWM3NmQ4YjMyZjRjMzc1ZTFmMzJkYjIxNmU1M2M1YmNhMWY4NTY2In0=` },
    //   })
    //   .then((resp: any) => {
    //     // resolve(resp.data)
    //     console.log(resp.data)
    //   })
    //   .catch((e: any) => {
    //     console.log(e)
    //   })
  }
}

module.exports = {
  async setTemps(req: any, res: any) {
    await spiderTempFormal(0, req.query)
    console.log('--> 采集结束，参数: ' + JSON.stringify(req.query))
    res && res.json({ code: 200, msg: req.query.page + '---' + new Date() })
  },
  async setTemps2(req: any, cb: any) {
    await spiderTempFormal(0, req)
    console.log('--> 采集结束，参数: ' + JSON.stringify(req))
    cb(req.query.page + '---' + new Date())
  },
  async setComps(req: any, res: any) {
    // await spiderTempTestGD(2)
    // await spiderTemp(1, 340)
    await spiderTempFormal(1, req.query)
    // console.log('采集结束，新增组件 30 个')
    res.json({ code: 200, msg: '运行结束' + new Date() })
  },


  proxyGet(req: any, res: any) {
    let url = req.query.url
    delete req.query.url
    http.get(url, { params: req.query }).then((resp: any) => {
      res.json(resp)
    })
  },
}

export {}
