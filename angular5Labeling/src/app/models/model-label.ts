import {Label} from './model.interfaces';

export class ModelLabel {
  id: number;
  name: string;
  color: string;
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}
