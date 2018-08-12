import { HttpClient } from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {ImageRegions} from '../models/model-imageRegions';
import {AnnotationService} from './annotation.service';
import {ImageMetaClass} from '../models/model-Image';
import {ModelRoi} from '../models/model-roi';
import {ModelTensorflow} from '../models/model-tensorflow';
import {ModelLabel} from '../models/model-label';

@Injectable()

export class DataService {

  getURL = 'http://10.150.133.137:5000/onemachine/';
  postURL = 'http://10.150.133.137:5000/humanlabeled/';
  getProposalURL = 'http://10.150.133.137:5000/getProposal/?path=';
  rootdir = 'http://10.150.133.137:3000';
  //getURL = 'http://127.0.0.1:5000/onemachine/';
  //postURL = 'http://127.0.0.1:5000/humanlabeled/';
  //rootdir = 'http://127.0.0.1:3000';
  data = [];
  tensorPostJSON: ModelTensorflow;
  tensorGetJSON: ModelTensorflow;
  annotationService: AnnotationService;
  constructor(@Inject(AnnotationService) annotationService: AnnotationService, private http: HttpClient, ) {
    this.annotationService = annotationService;
    this.getNewImage();

  }

  getNewImage() {
    this.http.get(this.getURL).subscribe(
      (data: any) => {
        this.tensorGetJSON = new ModelTensorflow(data);
      });
  }

  getProposals(x, y, w, h) {
    console.log(this.rootdir + this.tensorGetJSON.source_id);
    const coordsTuple = '(' + x + ',' + y + ',' + (x + w) + ',' + (y + h) + ')';
    console.log(w, h);
    return this.http.get(this.getProposalURL + this.tensorGetJSON.source_id + '&coords=' + coordsTuple);
  }

   loadLabels() {
      console.log(this.tensorGetJSON);
     this.annotationService.imageRegions.image = new ImageMetaClass({
       width: this.tensorGetJSON.width,
       height: this.tensorGetJSON.height,
       filename: this.tensorGetJSON.filename,
       source_id: this.rootdir + this.tensorGetJSON.source_id,
       sha256: this.tensorGetJSON.sha256,
       format: this.tensorGetJSON.format,
     });
     this.annotationService.image = this.annotationService.imageRegions.image;
     //alert(this.tensorGetJSON);

     for (let i = 0; i < this.tensorGetJSON.xMin.length; i++) {
       if (this.tensorGetJSON.label[i] < 30) {
         const newRoi = new ModelRoi({
           id: i,
           x: Math.round((this.tensorGetJSON.xMin[i]) * this.tensorGetJSON.width),
           y: Math.round((this.tensorGetJSON.yMin[i]) * this.tensorGetJSON.height),
           w: Math.round(Math.abs(this.tensorGetJSON.xMax[i] - this.tensorGetJSON.xMin[i]) * this.tensorGetJSON.width),
           h: Math.round(Math.abs(this.tensorGetJSON.yMax[i] - this.tensorGetJSON.yMin[i]) * this.tensorGetJSON.height),
           label: new ModelLabel(
             this.tensorGetJSON.label[i],
             this.annotationService.labelClasses[this.tensorGetJSON.label[i] - 1].name,
             this.annotationService.labelClasses[this.tensorGetJSON.label[i]].color)
         });
         this.annotationService.imageRegions.rois.push(newRoi);
       }
     }
  }

  selectLabel(id) {
    this.annotationService.clearData();
    this.annotationService.imageRegions.image = new ImageMetaClass({
      id: this.data[id]['image-id'],
      class: this.data[id].table,
      path:  this.data[id].path,
      typ: this.data[id]['file-typ'],
      width: this.data[id].width,
      height: this.data[id].height,
      size: this.data[id].size,
    });
    for (let i = 0; i < this.data[id].rois.length; i++) {
      const roi = new ModelRoi({
        id: i,
        label: this.data[id].rois[i].label,
        is_user_selected: false,
        x: this.data[id].rois[i].x,
        y: this.data[id].rois[i].y,
        h: this.data[id].rois[i].h,
        w: this.data[id].rois[i].w
      });
      this.annotationService.imageRegions.rois.push(roi);
    }
    this.annotationService.image = this.annotationService.imageRegions.image;
  }
  doPost() {
    this.tensorPostJSON = this.tensorGetJSON;
    this.tensorPostJSON.xMin = [];
    this.tensorPostJSON.yMin = [];
    this.tensorPostJSON.xMax = [];
    this.tensorPostJSON.yMax = [];
    this.tensorPostJSON.label = [];
    this.tensorPostJSON.detection_score = [];
    for (let i = 0; i < this.annotationService.imageRegions.rois.length; i ++) {
      this.tensorPostJSON.xMin.push(this.annotationService.imageRegions.rois[i].x / this.annotationService.image.width);
      this.tensorPostJSON.xMax.push((this.annotationService.imageRegions.rois[i].x - this.annotationService.imageRegions.rois[i].w) / this.annotationService.image.width);
      this.tensorPostJSON.yMin.push(this.annotationService.imageRegions.rois[i].y / this.annotationService.image.height);
      this.tensorPostJSON.yMax.push((this.annotationService.imageRegions.rois[i].y - this.annotationService.imageRegions.rois[i].h) / this.annotationService.image.height);
      this.tensorPostJSON.detection_score.push(1);
      this.tensorPostJSON.label.push((this.annotationService.imageRegions.rois[i].label.id));
    }
    this.http.post(this.postURL, this.tensorPostJSON).subscribe(res => console.log(res));
  }




}
