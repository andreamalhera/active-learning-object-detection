import {ImageMeta, Roi} from '../models/model.interfaces';
import { Observable, of } from 'rxjs';
import {Injectable} from '@angular/core';
import {ModelRoi} from '../models/model-roi';
import {Subject} from 'rxjs';

@Injectable()
export class SubimageService {
  activeROI = new ModelRoi({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    id: -1,
    is_user_selected: true});
  activeROIChange: Subject<Roi> = new Subject<Roi>();
  constructor() {
    this.activeROIChange.subscribe((value) => {
      this.activeROI = value;
    });
  }
  updateActiveROI(newRoi: Roi) {
    this.activeROIChange.next(newRoi);
  }
  update(): Observable <Roi> {
    return of(this.activeROI);
  }
}

/*
this Service is for getting the data from Server and send it back

 */
