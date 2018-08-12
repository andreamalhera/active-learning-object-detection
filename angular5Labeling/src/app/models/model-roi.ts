import {Label} from './model.interfaces';
import {ModelLabel} from './model-label';

export class ModelRoi {
  id: number;
  label: Label;
  is_user_selected: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  proposedLabels: Label[];

  constructor(data: any = {}) {
    this.proposedLabels = [];
    this.id = data.id;
    this.is_user_selected = true;
    this.label = data.label;
    this.x = data.x;
    this.y = data.y;
    this.w = data.w;
    this.h = data.h;
  }
}
/*
POST :



 */
