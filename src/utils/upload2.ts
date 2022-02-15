
import qiniu from 'qiniu';
import fs from 'fs';

interface IUploadClass {
    getUploadToken : (fileName: string) => IReturnTokenData;
}

interface IReturnTokenData {
    uploadToken: string;
    scope: string;
}

interface IConstructor {
    bucket: string;
    AccessKey: string;
    SecretKey: string;
    downloadUrl: string;
    zone?: 'Zone_z0' | 'Zone_z1' | 'Zone_z2' | 'Zone_na0' | 'Zone_as0';
}

class Upload implements IUploadClass {

    private bucket: string;
    private AccessKey: string;
    private SecretKey: string;
    private mac: null | qiniu.auth.digest.Mac;
    private BucketPolicy: null | qiniu.rs.BucketManager;
    private downloadUrl: string;
    private zone: qiniu.conf.Zone;

    /**
     * 
     * @param data 初始化数据 Object   
     *  data.bucket 存储空间名   
     *  data.AccessKey   
     *  data.SecretKey   
     *  data.downloadUrl 文件下载路径   
     *  data.zone 'Zone_z0' 华东 | 'Zone_z1' 华北 | 'Zone_z2' 华南(默认) | 'Zone_na0' 北美 | 'Zone_as0'   
     */
    constructor(data: IConstructor) {
        this.bucket = data.bucket;
        this.AccessKey = data.AccessKey;
        this.SecretKey = data.SecretKey;
        this.downloadUrl = data.downloadUrl;
        this.mac = null;
        this.BucketPolicy = null;
        this.zone = this.getZone(data.zone);
        this.auth();
    }

    private auth(): void {
        this.mac = new qiniu.auth.digest.Mac(this.AccessKey, this.SecretKey);
        if (this.mac) {
            this.BucketPolicy = new qiniu.rs.BucketManager(this.mac);
        }
    }

    private getZone(zoneName: string = ''): qiniu.conf.Zone {
        return (qiniu.zone as any)[zoneName] || qiniu.zone.Zone_z2;
    }

    // 获取上传凭证
    public getUploadToken(fileName: string = `${Date.now()}`): IReturnTokenData{
        let result = {
            uploadToken: '',
            scope: ''
        };
        if (this.mac) {
            const options = {
                scope: `${this.bucket}:${fileName}`,
                returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize)}',
            };
            const putPolicy = new qiniu.rs.PutPolicy(options);
            const uploadToken = putPolicy.uploadToken(this.mac);
            result = {uploadToken, scope: fileName};
        }
        return result;
    }

    /**
     * 获取文件下载地址
     * @param fileName 文件名
     */
    public downloadFile(fileName: string): string {
        let result = '';
        if (this.BucketPolicy) {
            result = this.BucketPolicy.publicDownloadUrl(this.downloadUrl, fileName);
        }
        return result;
    }

    /**
     * 获取文件信息
     * @param fileName 文件名
     */
    public getFileInfo(fileName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.BucketPolicy) {
                this.BucketPolicy.stat(this.bucket, fileName, (err: Error | undefined, body: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                })
            }
        })
    }

    /**
     * 移动文件｜修改文件名
     * @param fileName 源文件名
     * @param newFileName 新文件名
     * @param newBucket 新文件存放的存储空间(默认本空间)
     */
    public moveFile(fileName: string, newFileName: string, newBucket: string = this.bucket): Promise<any>  {
        return new Promise(async (resolve, reject) => {
            if (this.BucketPolicy) {
                const fileInfo = await this.getFileInfo(fileName);
                if (fileInfo.error) {
                    resolve(fileInfo);
                } else {
                    this.BucketPolicy.move(this.bucket, fileName, newBucket, newFileName, {} ,(err: Error | undefined, body: any) => {
                        if (err) {
                            reject(err);
                        }
                        resolve({ msg: 'move success' });
                    })
                }
                
            }
        })
    }

    /**
     * 复制文件
     * @param fileName 源文件名
     * @param newFileName 新文件名
     * @param newBucket 新文件存放的存储空间(默认本空间)
     */
    public copyFile(fileName: string, newFileName: string, newBucket: string = this.bucket): Promise<any>  {
        return new Promise((resolve, reject) => {
            if (this.BucketPolicy) {
                this.BucketPolicy.copy(this.bucket, fileName, newBucket, newFileName, {} ,(err: Error | undefined, body: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve({ msg: 'copy success' });
                })
            }
        })
    }

    /**
     * 删除文件
     * @param fileName 文件名
     */
    public deleteFile(fileName: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const fileInfo = await this.getFileInfo(fileName);
            if (fileInfo.error) {
                resolve(fileInfo);
            } else {
                if (this.BucketPolicy) {
                    this.BucketPolicy.delete(this.bucket, fileName, (err: Error | undefined, body: any) => {
                        if (err) {
                            reject(err);
                        }
                        resolve({ msg: 'delete file success' });
                    })
                }
            }
        })
    }

    // 判断文件是否存在
    private existsFile(path: string) {
        return new Promise((resolve) => {
            fs.exists(path, (isExists: boolean) => {
                resolve(isExists);
            })
        })
    }

    /**
     * 根据文件路径上传文件
     * @param filePath 源文件路径
     * @param uploadPath 上传到存储空间的文件路径
     */
    public uploadFileByPath(filePath: string, uploadPath: string) {
        return new Promise(async (resolve, reject) => {
            const isExists = await this.existsFile(filePath);
            if(!isExists) {
                reject('file is not exists');
            } else {
                if (this.mac) {
                    const config = new qiniu.conf.Config({
                        zone: this.zone,
                    })
                    const token = this.getUploadToken(uploadPath);
                    const uploader = new qiniu.form_up.FormUploader(config);
                    uploader.putFile(token.uploadToken, uploadPath, filePath, null, (err: Error | undefined, body: any) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(body);
                    })
                }
            }
        })
    }

    /**
     * 根据文件流上传到存储空间
     * @param stream 文件可读流
     * @param uploadPath 上传到存储空间的文件路径
     */
    public uploadFileByStream(stream: NodeJS.ReadableStream, uploadPath: string) {
        return new Promise(async (resolve, reject) => {
            if (this.mac) {
                const config = new qiniu.conf.Config({
                    zone: this.zone,
                })
                const token = this.getUploadToken(uploadPath);
                const uploader = new qiniu.form_up.FormUploader(config);
                uploader.putStream(token.uploadToken, uploadPath, stream, null, (err: Error | undefined, body: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                })
            }
        })
    }

    /**
     * 根据buffer上传到存储空间
     * @param buffer 文件可读流
     * @param uploadPath 上传到存储空间的文件路径
     */
    public uploadFileByBuffer(buffer: NodeJS.ArrayBufferView, uploadPath: string) {
        return new Promise(async (resolve, reject) => {
            if (this.mac) {
                const config = new qiniu.conf.Config({
                    zone: this.zone,
                })
                const token = this.getUploadToken(uploadPath);
                const uploader = new qiniu.form_up.FormUploader(config);
                uploader.put(token.uploadToken, uploadPath, buffer, null, (err: Error | undefined, body: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                })
            }
        })
    }
}

export default Upload;
