import {AfterViewInit, Input, Component, ElementRef, Inject, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AnnotationService} from '../services/annotation.service';
import {SubimageService} from '../services/subimage.service';
import {Roi} from '../models/model.interfaces';
import {ModelRoi} from '../models/model-roi';

@Component({
  selector: 'app-subimage',
  templateUrl: './subimage.component.html',
  styleUrls: ['./subimage.component.css']
})


export class SubimageComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() activeROI: ModelRoi = new ModelRoi();
  @ViewChild('selectedRegion') selectRegionCanvasRef: ElementRef;
  viewCtx: CanvasRenderingContext2D;
  rendered = false;
  viewCanvas: any;
  annotationService: AnnotationService;
  subimageService: SubimageService;
  constructor(@Inject(AnnotationService) annotationService: AnnotationService, @Inject(SubimageService) subImageService: SubimageService) {
    this.annotationService = annotationService;
    this.subimageService = subImageService;
    this.activeROI = this.subimageService.activeROI;
  }
  ngOnChanges() {
    this.drawSubImage();
  }
  ngAfterViewInit() {
    this.rendered = true;
    this.viewCanvas = this.selectRegionCanvasRef.nativeElement;
    this.viewCtx = this.selectRegionCanvasRef.nativeElement.getContext('2d');
  }
  ngOnInit() {

  }
  getImageScaleFactor(width, height, windowWidth, windowHeight) {
    if (width / windowWidth > height / windowHeight) {
      return width / windowWidth;
    } else {
      return height / windowHeight;
    }
  }
  drawSubImage() {
    this.update();
    if (this.rendered) {
      this.viewCtx.clearRect(0, 0, this.viewCanvas.width, this.viewCanvas.height);
      this.viewCtx.drawImage(
        this.annotationService.img,
        this.activeROI.x, this.activeROI.y,
        this.activeROI.w, this.activeROI.h,
        0, 0,
        this.viewCanvas.width, this.viewCanvas.height);
    }
  }
  update(): void {
    this.subimageService.update()
      .subscribe(newroi => this.activeROI = newroi);
  }
}
