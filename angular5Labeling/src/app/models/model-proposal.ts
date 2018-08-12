export class ModelProposal {
  label: number[];
  detection_score: number[];

  constructor(data: any = {}) {
    this.label = (data.label);
    this.detection_score = (data.detection_score);
  }
}
