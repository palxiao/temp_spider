// const { QiNiu } = require('../../config')
const qiNiu = require('qiniu')
// import moment from 'moment'

interface DeleteParams {
  bucket: string
  key: string | string[]
}
interface MoveParams {
  srcBucket: string
  srcKey: string
  destBucket: string
  destKey: string
  options: any
}

class Upload {
  private bucketManager: any
  private mac: any

  constructor(config: any) {
    this.bucketManager = null
    this.mac = null
    this.auth(config)
  }

  public auth({ AK: accessKey, SK: secretKey }: any) {
    // const { AK: accessKey, SK: secretKey } = QiNiu
    this.mac = new qiNiu.auth.digest.Mac(accessKey, secretKey)
    const config = new qiNiu.conf.Config()
    this.bucketManager = new qiNiu.rs.BucketManager(this.mac, config)
  }

  /**
   * getUploadToken
   */
  public getUploadToken(bucket: string, name: Object) {
    // 生成token
    const options = {
      scope: `${bucket}:${name}`,
    }
    const putPolicy = new qiNiu.rs.PutPolicy(options)
    return putPolicy.uploadToken(this.mac)
  }
  /**
   * 获取 鉴权的 Token
   */
  public getSignToken({ AK: accessKey, SK: secretKey }: any, path: string) {
    const credent = new qiNiu.Credentials(accessKey, secretKey)
    const token = credent.generateAccessToken({
      host: 'api.qiniu.com',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'GET',
      path,
    })
    return token
  }

  /**
   * 拉取空间列表及绑定域名
   */
  public listBucket() {
    const buckets: Object[] = []
    return new Promise((resolve) => {
      this.bucketManager.listBucket(async (err: any, respBody: any, respInfo: any) => {
        for (let i = 0; i < respInfo.data.length; i++) {
          const item = respInfo.data[i]
          const bucket: Object = await this.listBucketDomains(item)
          buckets.push(bucket)
        }
        resolve(buckets)
      })
    })
  }

  /**
   * listBucketDomains
   */
  public listBucketDomains(item: string): Object {
    return new Promise((resolve) => {
      this.bucketManager.listBucketDomains(item, (err: any, respBody: any, respInfo: any) => {
        // console.log(respInfo.data[0].domain)

        const { domain, tbl } = respInfo.data[0]
        resolve({ tbl, domain })
      })
    })
  }

  /**
   * listPrefix 拉取空间下的图片列表
   */
  public listPrefix(bucket: string, options: any) {
    /**
     * @param options 列举操作的可选参数
        prefix    列举的文件前缀
        limit     每次返回的最大列举文件数量
        marker    上一次列举返回的位置标记，作为本次列举的起点信息
        delimiter 指定目录分隔符
    */
    return new Promise((resolve) => {
      this.bucketManager.listPrefix(bucket, options, function (err: any, respBody: any, respInfo: any) {
        if (err) {
          console.log(err)
          throw err
        }
        if (respInfo.statusCode == 200) {
          //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
          //指定options里面的marker为这个值
          const items: any[] = []
          respBody.items.forEach((item: any) => {
            const { key, putTime } = item
            // items.push({ key, type })
            items.push(key)
            // console.log(item.putTime);http://img.palxp.com/blog/ECMAScript6.png
            // console.log(item.hash);
            // console.log(item.fsize);
            // console.log(item.mimeType);
            // console.log(item.endUser);
          })
          resolve({ data: items, marker: respBody.marker })
        } else {
          console.log(respInfo.statusCode)
          console.log(respBody)
        }
      })
    })
  }

  /**
   * fetchUrl 爬取网络图片
   */
  public fetchUrl(url: string, bucket: string, link: string) {
    /**
     * bucket 保存空间    link 保存的文件名 prefix/name
     */
    this.bucketManager.fetch(url, bucket, link, function (err: any, respBody: any, respInfo: any) {
      if (err) {
        console.log(err)
      } else {
        if (respInfo.statusCode == 200) {
          console.log(respBody.key)
          console.log(respBody.hash)
          console.log(respBody.fsize)
          console.log(respBody.mimeType)
        } else {
          console.log(respInfo.statusCode)
          console.log(respBody)
        }
      }
    })
  }

  /**
   * delete 删除图片 批量删除图片
   */
  public delete({ bucket, key }: DeleteParams) {
    return new Promise((resolve) => {
      if (typeof key === 'string') {
        this.bucketManager.delete(bucket, key, function (err: any, respBody: any, respInfo: any) {
          if (err) {
            console.log(err)
          } else {
            resolve(respInfo.statusCode)
            console.log(respBody)
          }
        })
      } else {
        const deleteOperations = []
        for (const itemKey of key) {
          deleteOperations.push(qiNiu.rs.deleteOp(bucket, itemKey))
        }
        this.bucketManager.batch(deleteOperations, function (err: any, respBody: any, respInfo: any) {
          if (err) {
            console.log(err)
          } else {
            resolve(respInfo.statusCode)
            console.log(respBody)
          }
        })
      }
    })
  }

  /**
   * move 移动或重命名  当bucketSrc==bucketDest相同的时候，就是重命名文件操作
   */
  public move({ srcBucket, srcKey, destBucket, destKey, options = {} }: MoveParams) {
    // @param srcBucket  源空间名称
    // @param srcKey     源文件名称
    // @param destBucket 目标空间名称
    // @param destKey    目标文件名称
    // @param options    可选参数
    return new Promise((resolve) => {
      console.log(srcBucket, srcKey, destBucket, destKey, options)

      this.bucketManager.move(srcBucket, srcKey, destBucket, destKey, options, function (err: any, respBody: any, respInfo: any) {
        if (err) {
          console.log(err)
        } else {
          resolve(respInfo.statusCode)
          console.log(respBody)
        }
      })
    })
  }

  /**
   * 根据buffer上传到存储空间
   * @param buffer 文件可读流
   * @param uploadPath 上传到存储空间的文件路径
   */
  public uploadFileByBuffer(bucket: string, uploadPath: string, buffer: NodeJS.ArrayBufferView) {
    return new Promise(async (resolve, reject) => {
      if (this.mac) {
        const config = new qiNiu.conf.Config()
        const token = this.getUploadToken(bucket, uploadPath)
        const uploader = new qiNiu.form_up.FormUploader(config)
        uploader.put(token, uploadPath, buffer, null, (err: Error | undefined, body: any) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        })
      }
    })
  }
}

module.exports = { Upload }
