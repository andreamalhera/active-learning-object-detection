import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Inject,
  OnChanges,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { HostBinding } from '@angular/core';
import {AnnotationService} from '../services/annotation.service';

import {ModelRoi} from '../models/model-roi';
import {SubimageService} from '../services/subimage.service';
import {LabelingService} from '../services/labeling.service';
import {DataService} from '../services/data.service';
import {ConfigService} from '../services/config.service';
import {Observable} from 'rxjs';
import {ImageRegions} from '../models/model-imageRegions';
import {Roi} from "../models/model.interfaces";


@Component({

  selector: 'app-labeling',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './labeling.component.html',
  styleUrls: ['./labeling.component.css']
})
export class LabelingComponent implements OnInit, AfterViewInit, OnChanges {

  windowWidth: number;
  windowHeight: number;
  imageWindowHeight: number;
  imageWindowWidth: number;
  navWidth: any;
  navHeight: any;
  imageCanvas: any;
  regionCanvas: any;
  imageCtx: CanvasRenderingContext2D;
  regionCtx: CanvasRenderingContext2D;
  regionClick_x: number;
  regionClick_y: number;
  click_x0: number;
  click_x1: number;
  click_y0: number;
  click_y1: number;
  current_x: number;
  current_y: number;
  subimageService: SubimageService;
  annotationService: AnnotationService;
  labelingService: LabelingService;
  configService: ConfigService;
  dataService: DataService;
  @HostBinding('style.width') width: number;
  @HostBinding('style.height') height: number;
  @ViewChild('image') imageCanvasRef: ElementRef;
  @ViewChild('regionCanvas') regionCanvasRef: ElementRef;
  @ViewChild('selectedRegion') selectRegionCanvasRef: ElementRef;
  @ViewChild('div8') div8: ElementRef;
  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    if (ev.key === 'Backspace') {
      this.deleteSelectedRegion();
      this.redrawRegCanvas();
      this.regionCanvas.focus();
    }
  }
  constructor(@Inject(AnnotationService) annotationService: AnnotationService,
              @Inject(SubimageService) subImageService: SubimageService,
              @Inject(LabelingService) labelingService: LabelingService,
              @Inject(ConfigService) configService: ConfigService,
              @Inject(DataService) dataService: DataService)  {

    this.annotationService = annotationService;
    this.subimageService = subImageService;
    this.labelingService = labelingService;
    this.configService = configService;
    this.dataService = dataService;

    this.current_x = 0;
    this.current_y = 0;
  }
  ngOnInit() {
    this.getWindowSize();
  }
  getWindowSize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.imageWindowHeight = window.innerHeight * 0.6 ;
    this.imageWindowWidth = this.div8.nativeElement.clientWidth ;
  }
  ngAfterViewInit() {
    this.imageCanvas = this.imageCanvasRef.nativeElement;
    this.imageCtx = this.imageCanvasRef.nativeElement.getContext('2d');
    this.regionCanvas = this.regionCanvasRef.nativeElement;
    this.regionCtx = this.regionCanvasRef.nativeElement.getContext('2d');
    this.annotationService.img.onload = () => {
      this.loadImage();
    };
    this.annotationService.img.src = this.annotationService.image.source_id;
    this.regionCanvas.addEventListener('mouseover', (e) => this.mouseOver(e));
    this.regionCanvas.addEventListener('mouseup', (e) => this.mouseUp(e));
    this.regionCanvas.addEventListener('mousemove', (e) => this.mouseMove(e));
    this.regionCanvas.addEventListener('mousedown', (e) => this.mouseDown(e));
    this.drawAllRegions_id();
    this.redrawRegCanvas();
    this.regionCanvas.focus();

  }
 ngOnChanges() {
    this.redrawRegCanvas();
    this.regionCanvas.focus();
 }

  mouseMove(e) {
    this.current_x = e.offsetX;
    this.current_y = e.offsetY;
    if (this.labelingService.isRegionBoundaryVisible) {
      if (!this.labelingService.isUserResizingRegion) {
        this.labelingService.regionEdge = this.labelingService.isOnRegionCorner(this.current_x, this.current_y);

        if (this.labelingService.regionEdge[0] === this.labelingService.userSelRegionId) {
          switch (this.labelingService.regionEdge[1]) {
            // rect
            case 1: // Fall-through // top-left corner of rect
            case 3: // bottom-right corner of rect
              this.regionCanvas.style.cursor = 'nwse-resize';
              break;
            case 2: // Fall-through // top-right corner of rect
            case 4: // bottom-left corner of rect
              this.regionCanvas.style.cursor = 'nesw-resize';
              break;

            // circle and ellipse
            case 5:
              this.regionCanvas.style.cursor = 'n-resize';
              break;
            case 6:
              this.regionCanvas.style.cursor = 'e-resize';
              break;

            default:
              this.regionCanvas.style.cursor = 'default';
              break;
          }
        } else {
          const yes = this.labelingService.isInsideThisRegion(this.current_x, this.current_y, this.labelingService.userSelRegionId);
          if (yes) {
            this.regionCanvas.style.cursor = 'move';
          } else {
            this.regionCanvas.style.cursor = 'default';
          }
        }
      }
    }

    if (this.labelingService.isUserDrawingRegion) {
      // draw region as the user drags the mouse cursor
      if (this.annotationService.imageRegions.rois.length) {
        this.redrawRegCanvas();
        // clear old intermediate rectangle
      } else {
        // first region being drawn, just clear the full region canvas
        this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
      }

      let region_x0, region_y0;

      if (this.click_x0 < this.current_x) {
        if (this.click_y0 < this.current_y) {
          region_x0 = this.click_x0;
          region_y0 = this.click_y0;
        } else {
          region_x0 = this.click_x0;
          region_y0 = this.current_y;
        }
      } else {
        if (this.click_y0 < this.current_y) {
          region_x0 = this.current_x;
          region_y0 = this.click_y0;
        } else {
          region_x0 = this.current_x;
          region_y0 = this.current_y;
        }
      }
      const dx = Math.round(Math.abs(this.current_x - this.click_x0));
      const dy = Math.round(Math.abs(this.current_y - this.click_y0));



      this.drawRectangleRegion(region_x0, region_y0, dx, dy, false, 'red');


      this.regionCanvas.focus();
    }


    if (this.labelingService.isUserResizingRegion ) {
      // user has clicked mouse on bounding box edge and is now moving it
      // draw region as the user drags the mouse coursor
      if (this.annotationService.imageRegions.rois.length) {
        this.redrawRegCanvas(); // clear old intermediate rectangle
      } else {
        // first region being drawn, just clear the full region canvas
        this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
      }


      const region_id = this.labelingService.regionEdge[0];
      const roi = this.annotationService.imageRegions.rois[region_id];


      const d = [roi.x / this.labelingService.navScaleFactor, roi.y / this.labelingService.navScaleFactor, 0, 0];
      d[2] = d[0] + roi.w / this.labelingService.navScaleFactor;
      d[3] = d[1] + roi.h / this.labelingService.navScaleFactor;

      const mx = this.current_x;
      const my = this.current_y;
      const preserve_aspect_ratio = false;
      this.rectangleUpdateCorner(this.labelingService.regionEdge[1], d, mx, my, preserve_aspect_ratio);
      this.rectangleStandardizeCoordinates(d);

      const w = Math.abs(d[2] - d[0]);
      const h = Math.abs(d[3] - d[1]);
      this.drawRectangleRegion(d[0], d[1], w, h, true, this.annotationService.imageRegions.rois[region_id].label.color);
      this.regionCanvas.focus();
    }

    if (this.labelingService.isUserMovingRegion) {
      // draw region as the user drags the mouse coursor
      if (this.annotationService.imageRegions.rois.length) {
        this.redrawRegCanvas(); // clear old intermediate rectangle
      } else {
        // first region being drawn, just clear the full region canvas
        this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
      }
      const move_x = (this.current_x - this.regionClick_x);
      const move_y = (this.current_y - this.regionClick_y);
      const roi = this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId];
      this.drawRectangleRegion(
        roi.x / this.labelingService.navScaleFactor + move_x,
        roi.y / this.labelingService.navScaleFactor + move_y,
        roi.w / this.labelingService.navScaleFactor, roi.h / this.labelingService.navScaleFactor,
        true,
        this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].label.color);



      this.regionCanvas.focus();
      return;
    }



  }
  selectRegion(id) {
    this.annotationService.toogleAllRegionsSelection(false);
    this.annotationService.imageRegions.rois[id].is_user_selected = true;
    this.redrawRegCanvas();
    this.labelingService.userSelRegionId = id;
  }
  mouseDown(e) {
    this.click_x0 = e.offsetX;
    this.click_y0 = e.offsetY;
    // this.drawRectangle2(e.offsetX,e.offsetY,100,100);
    this.labelingService.regionEdge = this.labelingService.isOnRegionCorner(this.click_x0, this.click_y0);
    const regionId = this.labelingService.isInsideRegion(this.click_x0, this.click_y0);
    if (this.labelingService.isRegionSelected) {
      // check if user clicked on the region boundary
      if ( this.labelingService.regionEdge[1] > 0 ) {
        if ( !this.labelingService.isUserResizingRegion ) {
          // resize region
          if ( this.labelingService.regionEdge[0] !== this.labelingService.userSelRegionId ) {
            this.labelingService.userSelRegionId = this.labelingService.regionEdge[0];
          }
          this.labelingService.isUserResizingRegion = true;
        }
      } else {
        if (this.labelingService.isInsideThisRegion(this.click_x0, this.click_y0, this.labelingService.userSelRegionId)) {
          if (!this.labelingService.isUserMovingRegion ) {
            this.labelingService.isUserMovingRegion = true;
            this.regionClick_x = this.click_x0;
            this.regionClick_y = this.click_y0;
          }
        }
        if (regionId === -1) {
          this.labelingService.isUserDrawingRegion = true;
          this.labelingService.isRegionSelected = false;
          this.labelingService.userSelRegionId = -1;
          this.annotationService.toogleAllRegionsSelection(false);
        }
      }
    } else {
      if ( regionId === -1 ) {
        // mousedown outside a region
        this.labelingService.isUserDrawingRegion = true;


      } else {
        // mousedown inside a region
        // this could lead to (1) region selection or (2) region drawing
        this.labelingService.isUserDrawingRegion = true;
      }
    }
    e.preventDefault();
  }
  mouseOver(e) {
    this.redrawRegCanvas();
    this.regionCanvas.focus();
  }
  mouseUp(e) {
    this.click_x1 = e.offsetX;
    this.click_y1 = e.offsetY;
    const click_dx = Math.abs(this.click_x1 - this.click_x0);
    const click_dy = Math.abs(this.click_y1 - this.click_y0);

    // indicates that user has finished moving a region
    if (this.labelingService.isUserMovingRegion ) {
      this.labelingService.isUserMovingRegion = false;
      this.regionCanvas.style.cursor = 'move';

      const move_x = Math.round((this.click_x1 - this.regionClick_x) * this.labelingService.navScaleFactor);
      const move_y = Math.round((this.click_y1 - this.regionClick_y) * this.labelingService.navScaleFactor);
      console.log(move_x, move_y);
      if (Math.abs(move_x) > this.labelingService.mouseClickTolerance || Math.abs(move_y) > this.labelingService.mouseClickTolerance) {
        const xnew = Math.round(this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].x ) + Math.round(move_x);
        const ynew = Math.round(this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].y) + Math.round(move_y);
        this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].x = Math.round( xnew );
        this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].y = Math.round( ynew );
        console.log(this.labelingService.navScaleFactor);
        console.log(this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId]);

      } else {
        const nested_region_id = this.labelingService.isInsideRegion(this.click_x0, this.click_y0);
        if (nested_region_id >= 0 &&
          nested_region_id !== this.labelingService.userSelRegionId) {
          this.labelingService.userSelRegionId = nested_region_id;
          this.labelingService.isRegionSelected = true;
          this.labelingService.isUserMovingRegion = false;

          // de-select all other regions if the user has not pressed Shift
          if ( !e.shiftKey ) {
            this.annotationService.toogleAllRegionsSelection(false);
          }
          this.setRegionSelectState(nested_region_id, true);
        }
      }
      this.redrawRegCanvas();
      this.regionCanvas.focus();
      return;
    }

    // indicates that user has finished resizing a region
    if ( this.labelingService.isUserResizingRegion ) {
      // _via_click(x0,y0) to _via_click(x1,y1)
      this.labelingService.isUserResizingRegion = false;
      this.regionCanvas.style.cursor = 'default';

      // update the region
      const region_id = this.labelingService.regionEdge[0];




      const d = [ this.annotationService.imageRegions.rois[region_id].x,  this.annotationService.imageRegions.rois[region_id].y, 0, 0];
      d[2] = d[0] +  this.annotationService.imageRegions.rois[region_id].w;
      d[3] = d[1] +  this.annotationService.imageRegions.rois[region_id].h;

      const mx = this.current_x * this.labelingService.navScaleFactor;
      const my = this.current_y * this.labelingService.navScaleFactor;
      const preserve_aspect_ratio = false;

      // constrain (mx,my) to lie on a line connecting a diagonal of rectangle


      this.rectangleUpdateCorner(this.labelingService.regionEdge[1], d, mx, my, preserve_aspect_ratio);
      this.rectangleStandardizeCoordinates(d);

      const w = Math.abs(d[2] - d[0]) ;
      const h = Math.abs(d[3] - d[1]) ;


      this.annotationService.imageRegions.rois[region_id].x = Math.round(  d[0]);
      this.annotationService.imageRegions.rois[region_id].y = Math.round(  d[1]);
      this.annotationService.imageRegions.rois[region_id].w = Math.round(  w);
      this.annotationService.imageRegions.rois[region_id].h = Math.round(  h );



      this.redrawRegCanvas();
      this.regionCanvas.focus();
      return;
    }

    // denotes a single click (= mouse down + mouse up)
    if ( click_dx < this.labelingService.mouseClickTolerance ||
      click_dy < this.labelingService.mouseClickTolerance ) {

      const region_id = this.labelingService.isInsideRegion(this.click_x0, this.click_y0);
      if ( region_id >= 0 ) {
        // first click selects region
        this.labelingService.userSelRegionId     = region_id;
        this.labelingService.isRegionSelected     = true;
        this.labelingService.isUserMovingRegion  = false;
        this.labelingService.isUserDrawingRegion = false;
        this.annotationService.imageRegions.rois[region_id].is_user_selected = true;


        // de-select all other regions if the user has not pressed Shift
        if ( !e.shiftKey ) {
          this.annotationService.toogleAllRegionsSelection(false);
          if (this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].id != null) {
           // this.selectLabelRef.nativeElement.value = this.annotationService.imageRegions.rois[this.userSelRegionId].id;
          }
          if (this.annotationService.imageRegions.rois[this.labelingService.userSelRegionId].id === null) {
            // this.selectLabelRef.nativeElement.value = -1;
          }
        }
        this.setRegionSelectState(region_id, true);
      } else {
        if ( this.labelingService.isUserDrawingRegion ) {
          // clear all region selection
          this.labelingService.isUserDrawingRegion = false;
          this.labelingService.isRegionSelected     = false;
          this.annotationService.toogleAllRegionsSelection(false);
        }
      }

      this.redrawRegCanvas();
      this.regionCanvas.focus();
      return;
    }

    // indicates that user has finished drawing a new region
    if (this.labelingService.isUserDrawingRegion) {

      this.labelingService.isUserDrawingRegion = false;

      let region_x0, region_y0, region_x1, region_y1;
      // ensure that (x0,y0) is top-left and (x1,y1) is bottom-right
      if ( this.click_x0 < this.click_x1 ) {
        region_x0 = this.click_x0;
        region_x1 = this.click_x1;
      } else {
        region_x0 = this.click_x1;
        region_x1 = this.click_x0;
      }

      if ( this.click_y0 < this.click_y1 ) {
        region_y0 = this.click_y0;
        region_y1 = this.click_y1;
      } else {
        region_y0 = this.click_y1;
        region_y1 = this.click_y0;
      }
      const region_dx = Math.abs(region_x1 - region_x0);
      const region_dy = Math.abs(region_y1 - region_y0);
      // newly drawn region is automatically selected
      this.annotationService.toogleAllRegionsSelection(false);
      this.labelingService.isRegionSelected = true;
      this.labelingService.userSelRegionId = this.annotationService.imageRegions.rois.length; // new region's id
      if ( region_dx > this.configService.VIA_REGION_MIN_DIM ||
        region_dy > this.configService.VIA_REGION_MIN_DIM ) { // avoid regions with 0 dim
        const x = Math.round(region_x0 * this.labelingService.navScaleFactor);
        const y = Math.round(region_y0 * this.labelingService.navScaleFactor);
        const width  = Math.round(region_dx * this.labelingService.navScaleFactor);
        const height = Math.round(region_dy * this.labelingService.navScaleFactor);
        const newRoi = new ModelRoi({
          label: this.annotationService.activeLabel,
          id: this.labelingService.userSelRegionId,
          x: Math.round( x ),
          y: Math.round( y ),
          w: Math.round( width),
          h:  Math.round( height)
        });
        this.annotationService.imageRegions.rois.push(newRoi);
        this.labelingService.getProposals(newRoi.x, newRoi.y, newRoi.w , newRoi.h);

      }
      this.redrawRegCanvas();
      this.regionCanvas.focus();
      return;
    }
  }
  drawAllRegions() {
    for (let i = 0; i < this.annotationService.imageRegions.rois.length; ++i) {
      this.drawRectangleRegion(
        this.annotationService.imageRegions.rois[i].x / this.labelingService.navScaleFactor ,
        this.annotationService.imageRegions.rois[i].y / this.labelingService.navScaleFactor ,
        this.annotationService.imageRegions.rois[i].w / this.labelingService.navScaleFactor,
        this.annotationService.imageRegions.rois[i].h / this.labelingService.navScaleFactor,
        this.annotationService.imageRegions.rois[i].is_user_selected, this.annotationService.imageRegions.rois[i].label.color);



    }
  }
  drawAllRegions_id() {
    for (let i = 0; i < this.annotationService.imageRegions.rois.length; ++i) {
      const roi = this.annotationService.imageRegions.rois[i];
      const is_selected = this.annotationService.imageRegions.rois[i].is_user_selected;
      this.drawRectangleRegion(
        roi.x / this.labelingService.navScaleFactor, roi.y / this.labelingService.navScaleFactor,
        roi.w / this.labelingService.navScaleFactor, roi.h / this.labelingService.navScaleFactor,
        is_selected, this.annotationService.imageRegions.rois[i].label.color);
    }
  }
  redrawRegCanvas() {
    if (this.labelingService.isCurrentImageLoaded) {
      if (this.annotationService.imageRegions.rois.length > 0 ) {


        this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
        if (this.labelingService.isRegionBoundaryVisible) {
          this.drawAllRegions();
        }

        if (this.labelingService.isRegionIdVisible) {
          this.drawAllRegions_id();
        }
      }
    }
  }
  drawRectangle(x, y, w, h) {
    this.regionCtx.beginPath();
    this.regionCtx.moveTo(x  , y);
    this.regionCtx.lineTo(x + w, y);
    this.regionCtx.lineTo(x + w, y + h);
    this.regionCtx.lineTo(x  , y + h);
    this.regionCtx.closePath();
  }
  drawControlPoint(cx, cy) {
    this.regionCtx.beginPath();
    this.regionCtx.arc(cx, cy, this.configService.VIA_REGION_POINT_RADIUS, 0, 2 * Math.PI, false);
    this.regionCtx.closePath();

    this.regionCtx.fillStyle = this.configService.VIA_THEME_CONTROL_POINT_COLOR;
    this.regionCtx.globalAlpha = 1.0;
    this.regionCtx.fill();

  }
  rectangleUpdateCorner(corner_id, d, x, y, preserve_aspect_ratio) {
    if (preserve_aspect_ratio) {
      switch (corner_id) {
        case 1: // Fall-through // top-left
        case 3: // bottom-right
          const dx3 = d[2] - d[0];
          const dy3 = d[3] - d[1];
          const norm3 = Math.sqrt( dx3 * dx3 + dy3 * dy3 );
          const nx3 = dx3 / norm3; // x component of unit vector along the diagonal of rect
          const ny3 = dy3 / norm3; // y component
          const proj3 = (x - d[0]) * nx3 + (y - d[1]) * ny3;
          const proj_x3 = nx3 * proj3;
          const proj_y3 = ny3 * proj3;
          // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
          x = Math.round( d[0] + proj_x3 );
          y = Math.round( d[1] + proj_y3 );
          break;
        case 2: // Fall-through // top-right
        case 4: // bottom-left
          const dx = d[2] - d[0];
          const dy = d[1] - d[3];
          const norm = Math.sqrt( dx * dx + dy * dy );
          const nx = dx / norm; // x component of unit vector along the diagonal of rect
          const ny = dy / norm; // y component
          const proj = (x - d[0]) * nx + (y - d[3]) * ny;
          const proj_x = nx * proj;
          const proj_y = ny * proj;
          // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
          x = Math.round( d[0] + proj_x );
          y = Math.round( d[3] + proj_y );
          break;
      }
    }
    switch (corner_id) {
      case 1: // top-left
        d[0] = x;
        d[1] = y;
        break;

      case 3: // bottom-right
        d[2] = x;
        d[3] = y;
        break;

      case 2: // top-right
        d[2] = x;
        d[1] = y;
        break;

      case 4: // bottom-left
        d[0] = x;
        d[3] = y;
        break;
    }
  }
  rectangleStandardizeCoordinates(d) {
    if ( d[0] > d[2] ) {
      // swap
      const t = d[0];
      d[0] = d[2];
      d[2] = t;
    }
    if ( d[1] > d[3] ) {
      // swap
      const t = d[1];
      d[1] = d[3];
      d[3] = t;
    }
  }
  drawRectangleRegion(x, y, w, h, is_selected, color) {
    if (is_selected) {
      this.drawRectangle(x, y, w, h);
      this.drawSubImage(
        x * this.labelingService.navScaleFactor,
        y * this.labelingService.navScaleFactor,
        w * this.labelingService.navScaleFactor,
        h * this.labelingService.navScaleFactor);
      this.regionCtx.strokeStyle = this.configService.VIA_THEME_BOUNDARY_LINE_COLOR;
      this.regionCtx.lineWidth   = this.configService.VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
      this.regionCtx.stroke();
      this.regionCtx.fillStyle   = this.configService.VIA_THEME_SEL_REGION_FILL_COLOR;
      this.regionCtx.globalAlpha = this.configService.VIA_THEME_SEL_REGION_OPACITY;
      this.regionCtx.fill();
      this.regionCtx.globalAlpha = 1.0;
      this.drawControlPoint(x, y);
      this.drawControlPoint(x + w, y + h);
      this.drawControlPoint(x  , y + h);
      this.drawControlPoint(x + w,   y);
    } else {
      this.drawRectangle(x, y, w, h);
      this.regionCtx.strokeStyle = this.configService.VIA_THEME_BOUNDARY_LINE_COLOR;
      this.regionCtx.lineWidth   = this.configService.VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
      this.regionCtx.stroke();
      this.regionCtx.fillStyle   = color; // this.annotationService.imageRegions.rois[this.userSelRegionId].region_attributes.color;
      this.regionCtx.globalAlpha = this.configService.VIA_THEME_UNSEL_REGION_OPACITY;
      this.regionCtx.fill();
      this.regionCtx.globalAlpha = 1.0;
    }
  }
  setRegionSelectState(region_id, is_selected) {
    this.annotationService.imageRegions.rois[region_id].is_user_selected = is_selected;
  }
  deleteSelectedRegion() {


    let del_region_count = 0;
    if ( this.labelingService.isAllRegionSelected ) {
      del_region_count = this.annotationService.imageRegions.rois.length;
      this.annotationService.imageRegions.rois.splice(0);
    } else {
      const sorted_sel_reg_id = [];
      for ( let i = 0; i < this.annotationService.imageRegions.rois.length; ++i ) {
        if ( this.annotationService.imageRegions.rois[i].is_user_selected ) {
          sorted_sel_reg_id.push(i);
        }
      }
      sorted_sel_reg_id.sort( function(a, b) {
        return (b - a);
      });
      for ( let i = 0; i < sorted_sel_reg_id.length; ++i ) {
        this.annotationService.imageRegions.rois.splice( sorted_sel_reg_id[i], 1);
        del_region_count += 1;
      }
    }

    this.labelingService.isAllRegionSelected = false;
    this.labelingService.isRegionSelected     = false;
    this.labelingService.userSelRegionId     = -1;

    if ( this.annotationService.imageRegions.rois.length === 0 ) {
      // all regions were deleted, hence clear region canvas
      this.clearRegionCanvas(); // _via_clear_reg_canvas();
    } else {
      this.redrawRegCanvas();
    }
    this.regionCanvas.focus();



  }
  clearRegionCanvas() {
    this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
  }
  drawSubImage(x, y, w, h) {
    const roi = new ModelRoi({
      id: this.labelingService.userSelRegionId,
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h:  Math.round(h)
    });
    this.subimageService.updateActiveROI(roi);
  }
  loadImage() {
    this.labelingService.navScaleFactor = this.labelingService.getImageScaleFactor(
      this.annotationService.img.width, this.annotationService.img.height,
      this.imageWindowWidth, this.imageWindowHeight);
    this.navWidth = this.annotationService.img.width / this.labelingService.navScaleFactor;
    this.navHeight = this.annotationService.img.height / this.labelingService.navScaleFactor;


    this.imageCtx.canvas.width = this.navWidth;
    this.imageCtx.canvas.height = this.navHeight;

    this.regionCtx.canvas.height = this.navHeight;
    this.regionCtx.canvas.width = this.navWidth;
    this.imageCtx.drawImage(
      this.annotationService.img,
      0, 0,
      this.annotationService.img.width, this.annotationService.img.height,
      0, 0,
      this.annotationService.img.width / this.labelingService.navScaleFactor,
      this.annotationService.img.height / this.labelingService.navScaleFactor);
  }
}
