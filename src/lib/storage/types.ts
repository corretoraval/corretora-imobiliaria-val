export type UploadResult = {
  url: string;
  path: string;
};

type SignedUploadResult = UploadResult & {
  uploadUrl: string;
};

export interface StorageProvider {
  uploadFile: (buffer: Buffer, destPath: string) => Promise<UploadResult>;
  createSignedUploadUrl?: (
    filename: string,
    contentType: string,
  ) => Promise<SignedUploadResult>;
  getUrl: (path: string) => string;
  deleteFile: (path: string) => Promise<void>;
}
