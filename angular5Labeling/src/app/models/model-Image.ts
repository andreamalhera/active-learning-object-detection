export class ImageMetaClass {
  height: number;
  width: number;
  filename: string;
  source_id: string;
  last_modified: number;
  sha256: string;
  format: string;
  constructor(data: any = {}) {
    this.width = data.width;
    this.height = data.height;
    this.filename = data.filename;
    this.source_id = data.source_id;
    this.last_modified = data.last_modified;
    this.sha256 = data.sha256;
    this.format = data.format;
  }
}
