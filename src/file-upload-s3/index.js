// @flow
import { S3 } from 'aws-sdk';
import { NoConfigException } from './file-upload.exceptions';

type S3Config = {
  accessKeyId: string,
  secretAccessKey: string,
  region: string
};

type UploadConfig = {
  s3: S3Config,
  bucket: string,
  urlExpiration?: number
};

type UploadData = {
  file: Buffer,
  key: string,
  success?: Function,
  error?: Function
};

export default class FileUpload {
  s3: Object;

  config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
    this.checkConfig();
    this.s3 = new S3(config.s3);
  }

  checkConfig() {
    if (!this.config)
      throw new NoConfigException('Configuration object not supplied');
    if (!this.config.s3)
      throw new NoConfigException('Configuration expects property s3<object>');
    if (!this.config.bucket)
      throw new NoConfigException('Configuration requires bucket<string>');
  }

  async upload(data: UploadData) {
    await this.s3
      .putObject({
        Bucket: this.config.bucket,
        Key: data.key,
        Body: data.file
      })
      .promise();
    const url = this.getUrl(data.key);
    return url;
  }

  getUrl(key: string): string {
    const params = {
      Bucket: this.config.bucket,
      Key: key,
      Expires: this.config.urlExpiration || 120
    };
    return this.s3.getSignedUrl('getObject', params);
  }
}
