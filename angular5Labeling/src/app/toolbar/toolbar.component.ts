import {Component, Inject, OnInit} from '@angular/core';
import {SubimageService} from '../services/subimage.service';
import {AnnotationService} from '../services/annotation.service';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  // annotationService: AnnotationService;
  // constructor(@Inject(AnnotationService) annotationService: AnnotationService, public subImageService: SubimageService) {
  //   this.annotationService = annotationService;
  // }

  dataService: DataService;
  subImageService: SubimageService
  constructor(@Inject(DataService) dataService: DataService, @Inject(SubimageService) subImageService: SubimageService) {
    this.subImageService = subImageService;
    this.dataService = dataService;
  }
}
