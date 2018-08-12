import {Component, Inject, OnInit} from '@angular/core';
import {SubimageService} from '../services/subimage.service';
import {AnnotationService} from '../services/annotation.service';
import {LabelingService} from '../services/labeling.service';

@Component({
  selector: 'app-rois-table',
  templateUrl: './rois-table.component.html',
  styleUrls: ['./rois-table.component.css']
})
export class RoisTableComponent implements OnInit {

  subImageService: SubimageService;
  annotationService: AnnotationService;
  labelingService: LabelingService;
  constructor(@Inject(AnnotationService) annotationService: AnnotationService, @Inject(LabelingService) labelingService: LabelingService, @Inject(SubimageService) subImageService: SubimageService) {
    this.subImageService = subImageService;
    this.annotationService = annotationService;
	this.labelingService = labelingService;
  }

  ngOnInit() {
    this.annotationService.toogleAllRegionsSelection(false);
  }

  selectRegion(id) {
	console.log("Selected Id: " + id);
    console.log(this.annotationService.imageRegions.rois);
    this.annotationService.toogleAllRegionsSelection(false);
	for (let i = 0; i < this.annotationService.imageRegions.rois.length; i++) {
		if (this.annotationService.imageRegions.rois[i].id == id) {
			this.annotationService.imageRegions.rois[i].is_user_selected = true;
			this.annotationService.selectROI(this.annotationService.imageRegions.rois[i]);
		}
	}
    
	this.labelingService.userSelRegionId = id;
  }
}
