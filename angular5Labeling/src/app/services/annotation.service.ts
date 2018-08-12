import {ImageMeta, Label, Roi} from '../models/model.interfaces';
import {ImageRegions} from '../models/model-imageRegions';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {ImageMetaClass} from '../models/model-Image';
import {SubimageService} from './subimage.service';
import {forEach} from '@angular/router/src/utils/collection';
import {ModelLabel} from '../models/model-label';
import {timestamp} from 'rxjs/operators';
import {ModelRoi} from '../models/model-roi';
import {Color} from '../models/color';
import {DataService} from './data.service';

@Injectable()

export class AnnotationService {
  setView = false;
  color = new Color().colors;
  img = new Image();
  image: ImageMeta;
  activeLabel: Label;
  activeROI: Roi;
  imageRegions = new ImageRegions();
  labelClasses: ModelLabel[];

  subImageService: SubimageService;
  constructor(private http: HttpClient, @Inject(SubimageService) subImageService: SubimageService) {
    this.imageRegions.rois = [];
    this.labelClasses = [];
    this.getClasses();
    this.activeLabel = new ModelLabel(3, 'car', this.color[3]);
	  this.subImageService = subImageService;
  }
  clearData() {
    this.imageRegions.rois = [];
    this.imageRegions.scaleFactor = 1;
  }

  toogleAllRegionsSelection(is_selected) {
    for (let i = 0; i < this.imageRegions.rois.length; ++i) {
      this.imageRegions.rois[i].is_user_selected = is_selected;
    }
  }
  discard() {
    this.imageRegions = new ImageRegions();
  }
  selectROI(roi: Roi) {
    this.subImageService.updateActiveROI(roi);
  }

  deleteROI(c: ModelRoi) {
    const result = this.imageRegions.rois.find(roi => roi.id === c.id)
    const sorted_sel_reg_id = [];
    for ( let i = 0; i < this.imageRegions.rois.length; ++i ) {
      if ( this.imageRegions.rois[i].is_user_selected ) {
        sorted_sel_reg_id.push(i);
      }
    }
    sorted_sel_reg_id.sort( function(a, b) {
      return (b - a);
    });
    for ( let i = 0; i < sorted_sel_reg_id.length; ++i ) {
      this.imageRegions.rois.splice( sorted_sel_reg_id[i], 1);
    }
  }

  getClasses() {
    this.http.get('../../assets/kitti_label_map.pbtxt', {responseType: 'text'}).subscribe(
      (data1: any) => {
        const line =  data1.split('\n');
        let i;
		let classId;
        for (i in line) {
          if (line[i].includes('id')) {
            classId = line[i].split(':')[1];
          }
		  if (line[i].includes('name')) {
			let className = line[i].split('\'')[1];
			this.labelClasses.push(new ModelLabel(parseFloat(classId), className, this.color[parseFloat(classId) % this.color.length]));
		  }
        }

      }, // success path
      error => {
        console.log(error);
      }
    );
  }
}

/*
this Service is for getting the data from Server and send it back

 */
