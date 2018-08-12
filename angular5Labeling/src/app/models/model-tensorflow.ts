
export class ModelTensorflow {
  width: number;
  height: number;
  filename: string;
  source_id: string;
  sha256: any;
  format: string;
  detection_score: number[];
  label: number[];
  xMin: number[];
  yMin: number[];
  xMax: number[];
  yMax: number[];

  constructor(data: any = {}) {
    this.width = JSON.parse(data.width);
    this.height = JSON.parse(data.height);
    this.filename = (data.filename);
    this.source_id = (data.source_id);
    this.sha256 = (data.sha256);
    this.format = (data.format);
    this.detection_score = JSON.parse(data.detection_score);
    this.xMin = JSON.parse(data['bbox/xmin']);
    this.xMax = JSON.parse(data['bbox/xmax']);
    this.yMin = JSON.parse(data['bbox/ymin']);
    this.yMax = JSON.parse(data['bbox/ymax']);
    this.label = JSON.parse(data.label);
    this.limiter();
  }
  limiter() {
    for (let i = 0; this.label.length > i; i++) {
      this.label[i] = (this.label[i] % 10) + 1;
    }
  }
}
