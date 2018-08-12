import {Component, Inject, OnInit} from '@angular/core';
import {SubimageService} from '../services/subimage.service';
import {AnnotationService} from '../services/annotation.service';
import {LabelingService} from '../services/labeling.service';

@Component({
  selector: 'app-class-table',
  templateUrl: './class-table.component.html',
  styleUrls: ['./class-table.component.css']
})
export class ClassTableComponent implements OnInit {

  classLabels: any[];
  actualLabelClasses: any[];
  searchText: string;
  annotationService: AnnotationService;
  labelingService: LabelingService;
  constructor(@Inject(AnnotationService) annotationService: AnnotationService, @Inject(LabelingService) labelingService: LabelingService) {
    this.annotationService = annotationService;
	this.labelingService = labelingService;
	this.classLabels = this.annotationService.labelClasses;
	this.actualLabelClasses = this.classLabels;
  }

  ngOnInit() {}

  test(id: number) {
    this.labelingService.changeClass(this.classLabels[(id - 1)]);
  }
  searchLabel() {
    this.classLabels = this.annotationService.labelClasses;
    this.actualLabelClasses = this.classLabels;
    let changed = false;
    if (this.searchText != null) {
      this.actualLabelClasses = [];
      for (let i = 0; i < this.classLabels.length; i++) {
        if (this.classLabels[i].name.includes(this.searchText)) {
          this.actualLabelClasses.push(this.classLabels[i]);
          changed = true;
        }
      }
    }
  }
}


