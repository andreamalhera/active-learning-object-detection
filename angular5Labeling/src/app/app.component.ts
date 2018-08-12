// feature modules:
import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AnnotationService} from './services/annotation.service';
import {SubimageService} from './services/subimage.service';
import {LabelingService} from './services/labeling.service';
import {ConfigService} from './services/config.service';
import {DataService} from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit, AfterViewInit {

  dataService: DataService;
  annotationService: AnnotationService;
  constructor(@Inject(AnnotationService) annotationService: AnnotationService,
              @Inject(DataService) dataService: DataService,
              private subImageService: SubimageService,
              private labelingService: LabelingService,
              private configService: ConfigService)  {
    this.annotationService = annotationService;
    this.dataService = dataService;
  }
  ngOnInit() {
  }
  ngAfterViewInit() {

  }
}



