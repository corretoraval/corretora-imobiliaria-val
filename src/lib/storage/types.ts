export type UploadResult = {
  url: string;
  path: string;
};

export interface StorageProvider {
  uploadFile: (buffer: Buffer, destPath: string) => Promise<UploadResult>;
  getUrl: (path: string) => string;
  deleteFile: (path: string) => Promise<void>;
}
