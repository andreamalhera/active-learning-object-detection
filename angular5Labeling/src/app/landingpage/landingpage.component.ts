import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {AnnotationService} from '../services/annotation.service';
import {ConfigService} from '../services/config.service';
import {SubimageService} from '../services/subimage.service';
import {LabelingService} from '../services/labeling.service';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements AfterViewInit, OnInit{

  dataService: DataService;
  annotationService: AnnotationService;

  constructor(@Inject(AnnotationService) annotationService: AnnotationService,
              @Inject(DataService) dataService: DataService)  {
    this.dataService = dataService;
    this.annotationService = annotationService;
  }
  ngOnInit() {
    // console.log(this.dataService);
    console.log("test")
    console.log(this.annotationService.imageRegions.image); //TODO
  }
  ngAfterViewInit() {

  }
}
