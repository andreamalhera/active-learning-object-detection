import { HttpClient } from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {AnnotationService} from './annotation.service';
import {ModelLabel} from '../models/model-label';
import {SubimageService} from './subimage.service';
import {ModelProposal} from '../models/model-proposal';
import {DataService} from './data.service';
import {Label} from '../models/model.interfaces';


@Injectable()


export class LabelingService {
  regionEdge: number[];
  navScaleFactor: number;
  regionEdgeTolerance: number;
  mouseClickTolerance: number;
  userSelRegionId: number;
  isUserResizingRegion: boolean;
  isUserMovingRegion: boolean;
  isUserDrawingRegion: boolean;
  isRegionSelected: boolean;
  isAllRegionSelected: boolean;
  isCurrentImageLoaded: boolean;
  isRegionBoundaryVisible: boolean;
  isRegionIdVisible: boolean;
  currentClassProposal: Label [] = [];
  annotationService: AnnotationService;
  dataService: DataService;
  constructor(private http: HttpClient, @Inject(AnnotationService) annotationService: AnnotationService, dataService: DataService) {
    this.annotationService = annotationService;
	this.dataService = dataService;
    this.regionEdgeTolerance = 5;
    this.mouseClickTolerance = 2;
    this.isUserDrawingRegion = false;
    this.isUserResizingRegion = false;
    this.isUserMovingRegion = false;
    this.isRegionSelected = false;
    this.isAllRegionSelected = false;
    this.isRegionBoundaryVisible = true;
    this.isRegionIdVisible = true;
    this.isCurrentImageLoaded = true;
    this.userSelRegionId     = -1;
    this.regionEdge = [-1, -1];
    this.navScaleFactor = 1;

  }

  changeClass(classLabel: ModelLabel) {
    if (this.isRegionSelected) {
      this.annotationService.imageRegions.rois[this.userSelRegionId].label = classLabel;
    }
  }

  getImageScaleFactor(width, height, windowWidth, windowHeight) {
    if (width / windowWidth > height / windowHeight) {
      return width / windowWidth;
    } else {
      return height / windowHeight;
    }
  }
  isOnRectEdge(x, y, w, h, px, py) {
    const dx0 = Math.abs(x - px);
    const dy0 = Math.abs(y - py);
    const dx1 = Math.abs(x + w - px);
    const dy1 = Math.abs(y + h - py);

    // [top-left=1,top-right=2,bottom-right=3,bottom-left=4]
    if (dx0 < this.regionEdgeTolerance && dy0 < this.regionEdgeTolerance ) {
      return 1;
    }
    if (dx1 < this.regionEdgeTolerance && dy0 < this.regionEdgeTolerance ) {
      return 2;
    }
    if (dx1 < this.regionEdgeTolerance && dy1 < this.regionEdgeTolerance ) {
      return 3;
    }

    if (dx0 < this.regionEdgeTolerance && dy1 < this.regionEdgeTolerance ) {
      return 4;
    }
    return 0;
  }
  isOnRegionCorner(px, py) {
    const regionEdge = [-1, -1]; // region_id, corner_id [top-left=1,top-right=2,bottom-right=3,bottom-left=4]

    for (let i = 0; i < this.annotationService.imageRegions.rois.length; ++i ) {
      const roi = this.annotationService.imageRegions.rois[i];
      let result = -1;
      regionEdge[0] = i;
      result = this.isOnRectEdge(
        roi.x  / this.navScaleFactor,
        roi.y  / this.navScaleFactor,
        roi.w / this.navScaleFactor,
        roi.h / this.navScaleFactor,
        px, py);

      if (result > 0) {
        regionEdge[1] = result;
        return regionEdge;
      }
    }
    regionEdge[0] = -1;
    return regionEdge;
  }
  isInsideRegion(px, py) {
    const N = this.annotationService.imageRegions.rois.length;
    if ( N === 0 ) {
      return -1;
    }
    const start = 0;
    const end   = N;
    const del   = 1;
    let i = start;
    while ( i !== end ) {
      const yes = this.isInsideThisRegion(px, py, i);
      if (yes) {
        return i;
      }
      i = i + del;
    }
    return -1;

  }
  isInsideThisRegion(px, py, regionId) {
    const N = this.annotationService.imageRegions.rois.length;
    if ( N === 0 ) {
      return -1;
    }
    const roi   = this.annotationService.imageRegions.rois[regionId];
    const result = this.isInsideRect(
      roi.x / this.navScaleFactor, roi.y  / this.navScaleFactor,
      roi.w / this.navScaleFactor, roi.h / this.navScaleFactor, px, py);
    return result;

  }

  isInsideRect(x, y, w, h, px, py) {
    return px > x && px < (x + w) && py > y && py < (y + h);
  }
  getProposals(x, y, w, h) {
    const loadedData = new ModelProposal({
      label: [2, 3, 4, 5, 1],
      detection_score: [1, 1, 1, 1, 1]
      });
     // const loadedData = new ModelProposal(data);
    console.log(loadedData);
    for (let i = 0; loadedData.label.length > i; i++) {
      if (!this.currentClassProposal.includes(this.annotationService.labelClasses[loadedData.label[i] - 1])) {
        this.currentClassProposal.push(this.annotationService.labelClasses[loadedData.label[i] - 1]);
        }
        if (this.currentClassProposal.length > 4) {
          break;
      }
    }
        this.annotationService.imageRegions.rois[this.userSelRegionId].label = this.currentClassProposal[0];
        this.annotationService.imageRegions.rois[this.userSelRegionId].proposedLabels = this.currentClassProposal;
        console.log(this.annotationService.imageRegions.rois[this.userSelRegionId].proposedLabels);

  }
}

