import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CanvasWhiteboardComponent} from 'ng2-canvas-whiteboard';
import { HostBinding } from '@angular/core';
import {LabelClasses} from "../models/LabelClasses";
import { Http, Response, RequestOptions, Headers, HttpModule, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map'

class ImageRegion {
    is_user_selected= false;//= false;
    shape_attributes = {};
    region_attributes = new LabelClasses(null,'','#0097A7');
}
class ImagaMetaData{
    regions =[];
    file_attributes = {};
    base64_img_data = '';
    fileName:string;
    fileRef= {};
    size:number;
    constructor(fileref, filename, size){
        this.fileRef = fileref;
        this.fileName = filename;
        this.size = size;
    }
}

@Component({
    host: {
        '(window:resize)': 'onResize($event)'
    },
    selector: 'app-user',
    viewProviders: [CanvasWhiteboardComponent],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './labeling.component.html',
    styleUrls: ['./labeling.component.css']
})
export class LabelingComponent implements OnInit, AfterViewInit{

    @HostListener('document:keyup', ['$event'])
    onKeyUp(ev:KeyboardEvent) {
        if(ev.key=='Backspace') {
            this.deleteSelectedRegion();
        }
    }

    @HostBinding('style.width') width: Number;
    @HostBinding('style.height') height: Number;
    @ViewChild('image') imageCanvasRef: ElementRef;
    @ViewChild('regionCanvas') regionCanvasRef: ElementRef;
	@ViewChild('selectElem') selectLabelRef: ElementRef;
    @ViewChild('selectedRegion') selectRegionCanvasRef: ElementRef;
    @ViewChild('div8') div8:ElementRef;
    @ViewChild('div4') div4:ElementRef;

    /*
    config refactoren und über Service farben zurückgeben
    */
    defaultLabel = new LabelClasses(1,'car','red');
    VIA_REGION_POINT_RADIUS       = 2;
    VIA_THEME_REGION_BOUNDARY_WIDTH = 0.5;
    VIA_THEME_BOUNDARY_LINE_COLOR   = "#1a1a1a";

    VIA_THEME_SEL_REGION_FILL_COLOR = "#fff";

    VIA_THEME_SEL_REGION_OPACITY    = 0.5;
    VIA_THEME_UNSEL_REGION_OPACITY = 0.2;

    VIA_THEME_CONTROL_POINT_COLOR   = '#ff0000';


     VIA_REGION_MIN_DIM            = 3;

     VIA_POLYGON_RESIZE_VERTEX_OFFSET    = 100;
     //TODO => should we implement zoom ? would bring other problems by using a zoomfactor (scaling,etc..)
     VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX = 3;
     VIA_CANVAS_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 4, 5];


     windowWidth:number;
     windowHeight:number;
     imageWindowHeight: number;
     imageWindowWidth: number;
     subImageWindowHeight: number;
     subImageWindowWidth: number;

    img =new Image();
    imgW:any;
    imgH:any;
	
    imgMetadata ={};
    imgId:number;

    navWidth:any;
    navHeight:any;

    viewHeight = 300;
    viewWidth = 300;

    fullImagePath: string;
	names: string[];

    imageCanvas:any;
    viewCanvas:any;
    regionCanvas:any;

    imageCtx: CanvasRenderingContext2D;
    viewCtx: CanvasRenderingContext2D;
    regionCtx: CanvasRenderingContext2D;

    navScaleFactor: number;
    subImageScaleFactor: number;
    canvasRegions: any[];
    regionEdgeTolerance: number;
    mouseClickTolerance:number;

	/*
	label lists
	*/
	searchText:string;
    classLabels:any[];
	actualClassLabels:any[];
	
    /*
    state of the application
     */
    isUserResizingRegion:boolean;
    isUserMovingRegion:boolean;
    isUserDrawingRegion:boolean;
    isRegionSelected:boolean;
    isAllRegionSelected:boolean;

    isCurrentImageLoaded:boolean;
    isRegionBoundaryVisible:boolean;
    isRegionIdVisible:boolean;


    /*
    region
    */
    userSelRegionId:number;
    regionClick_x:number;
    regionClick_y:number;
    regionEdge:number[];

    //firstClick and secondClick
    click_x0:number;
    click_x1:number;
    click_y0:number;
    click_y1:number;

    current_x:number;
    current_y:number;

	
	
	
    constructor(private http: Http){

		this.classLabels = [ new LabelClasses(1,'car','#0097A7'), new LabelClasses(2,'person','#00FF00'), new LabelClasses(3,'bus','#0197A7')];
        this.actualClassLabels = this.classLabels;
		this.fullImagePath = '../../assets/img/street.jpg';
        this.canvasRegions = [];
        this.regionEdgeTolerance = 5;
        this.mouseClickTolerance = 2;
        //state:
        this.isUserDrawingRegion = false;
        this.isUserResizingRegion = false;
        this.isUserMovingRegion = false;

        this.isRegionSelected = false;
        this.isAllRegionSelected= false;
        this.isRegionBoundaryVisible = true;
        this.isRegionIdVisible =true;

        this.isCurrentImageLoaded = true;


        //region
        this.userSelRegionId = -1;
        this.regionEdge = [-1,-1];

        this.current_x = 0;
        this.current_y = 0;
        this.imgId = 0;

    }
    ngOnInit(){
        this.getWindowSize();
	}

    getWindowSize(){
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.imageWindowHeight = window.innerHeight*0.6 ;
        this.imageWindowWidth = this.div8.nativeElement.clientWidth ;

        this.subImageWindowWidth = this.div4.nativeElement.clientWidth;
        this.subImageWindowHeight =  window.innerHeight*0.4;


    }



    ngAfterViewInit(){

        this.getImageRef(this.fullImagePath);
        this.imageCanvas = this.imageCanvasRef.nativeElement;
        this.imageCtx = this.imageCanvasRef.nativeElement.getContext('2d');

        this.regionCanvas = this.regionCanvasRef.nativeElement;
        this.regionCtx = this.regionCanvasRef.nativeElement.getContext('2d');

        this.viewCanvas = this.selectRegionCanvasRef.nativeElement;
        this.viewCtx = this.selectRegionCanvasRef.nativeElement.getContext('2d');

        this.img.onload = () => {this.loadImage();};
        this.img.src = this.fullImagePath;


        this.regionCanvas.addEventListener('mouseover', (e) => this.mouseOver(e));

        this.regionCanvas.addEventListener('mouseup', (e) => this.mouseUp(e));
        this.regionCanvas.addEventListener('mousemove', (e) => this.mouseMove(e));
        this.regionCanvas.addEventListener('mousedown',(e) => this.mouseDown(e));

    }


    mouseMove(e){
        if(!this.isCurrentImageLoaded){
            return;
        }
        this.current_x = e.offsetX;
        this.current_y = e.offsetY;

        if (this.isRegionBoundaryVisible) {
            if (!this.isUserResizingRegion) {
                this.regionEdge = this.isOnRegionCorner(this.current_x,this.current_y); //this.regionEdge = is_on_region_corner(this.current_x, this.current_y);

                if (this.regionEdge[0]===this.userSelRegionId){                              //( this.regionEdge[0] === _via_user_sel_region_id ) {
                    switch(this.regionEdge[1]) {
                        // rect
                        case 1: // Fall-through // top-left corner of rect
                        case 3: // bottom-right corner of rect
                            this.regionCanvas.style.cursor = "nwse-resize";
                            break;
                        case 2: // Fall-through // top-right corner of rect
                        case 4: // bottom-left corner of rect
                            this.regionCanvas.style.cursor = "nesw-resize";
                            break;

                        // circle and ellipse
                        case 5:
                            this.regionCanvas.style.cursor = "n-resize";
                            break;
                        case 6:
                            this.regionCanvas.style.cursor= "e-resize";
                            break;

                        default:
                            this.regionCanvas.style.cursor= "default";
                            break;
                    }

                    if (this.regionEdge[1] >= this.VIA_POLYGON_RESIZE_VERTEX_OFFSET) {
                        // indicates mouse over polygon vertex
                        this.regionCanvas.style.cursor= "crosshair";
                    }
                } else {
                    let yes = this.isInsideThisRegion(this.current_x, this.current_y, this.userSelRegionId); //is_inside_this_region(this.current_x, this.current_y, _via_user_sel_region_id);
                    if (yes) {
                        this.regionCanvas.style.cursor = "move";
                    } else {
                        this.regionCanvas.style.cursor = "default";
                    }
                }
            }
        }

        if(this.isUserDrawingRegion){       //_via_is_user_drawing_region) {
            // draw region as the user drags the mouse cursor
            if (this.canvasRegions.length) {
                this.redrawRegCanvas();                 // this.redrawRegCanvas();  clear old intermediate rectangle
            } else {
                // first region being drawn, just clear the full region canvas
                this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
            }

            let region_x0, region_y0;

            if (this.click_x0 < this.current_x){//( this.click_x0 < this.current_x ) {
                if(this.click_y0 < this.current_y){ //( this.click_y0 < this.current_y ) {
                    region_x0 = this.click_x0; //this.click_x0;
                    region_y0 = this.click_y0; //this.click_y0;
                } else {
                    region_x0 = this.click_x0; //this.click_x0;
                    region_y0 = this.current_y; //this.current_y;
                }
            } else {
                if (this.click_y0 < this.current_y){//( this.click_y0 < this.current_y ) {
                    region_x0 = this.current_x;//this.current_x;
                    region_y0 = this.click_y0//this.click_y0;
                } else {
                    region_x0 = this.current_x;
                    region_y0 = this.current_y;
                }
            }
            let dx = Math.round(Math.abs(this.current_x - this.click_x0));
            let dy = Math.round(Math.abs(this.current_y - this.click_y0));

        
            
            this.drawRectangleRegion(region_x0, region_y0, dx, dy, false, 'red');
                    

            this.regionCanvas.focus();
        }

       
        if (this.isUserResizingRegion ) {
            // user has clicked mouse on bounding box edge and is now moving it
            // draw region as the user drags the mouse coursor
            if (this.canvasRegions.length) {
                this.redrawRegCanvas(); // clear old intermediate rectangle
            } else {
                // first region being drawn, just clear the full region canvas
                this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
            }

            let region_id = this.regionEdge[0];
            let attr = this.canvasRegions[region_id].shape_attributes;

               
                    let d = [attr['x'], attr['y'], 0, 0];
                    d[2] = d[0] + attr['width'];
                    d[3] = d[1] + attr['height'];

                    let mx = this.current_x;
                    let my = this.current_y;
                    let preserve_aspect_ratio = false;
                    this.rectangleUpdateCorner(this.regionEdge[1], d, mx, my, preserve_aspect_ratio);
                    this.rectangleStandardizeCoordinates(d);

                    let w = Math.abs(d[2] - d[0]);
                    let h = Math.abs(d[3] - d[1]);
                    this.drawRectangleRegion(d[0], d[1], w, h, true, this.canvasRegions[region_id].region_attributes.color);
                 

             
            this.regionCanvas.focus();
        }

        if (this.isUserMovingRegion) {
            // draw region as the user drags the mouse coursor
            if (this.canvasRegions.length) {
                this.redrawRegCanvas(); // clear old intermediate rectangle
            } else {
                // first region being drawn, just clear the full region canvas
                this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
            }
            let move_x = (this.current_x - this.regionClick_x);
            let move_y = (this.current_y - this.regionClick_y);
            let attr = this.canvasRegions[this.userSelRegionId].shape_attributes;


            this.drawRectangleRegion(attr['x'] + move_x, attr['y'] + move_y, attr['width'], attr['height'], true, this.canvasRegions[this.userSelRegionId].region_attributes.color);



            this.regionCanvas.focus();
            return;
        }



    }
    selectRegion(id){
        this.toogleAllRegionsSelection(false);
        this.canvasRegions[id].is_user_selected =true;
        this.redrawRegCanvas();
        this.userSelRegionId = id;
    }
    mouseDown(e){
        this.click_x0 = e.offsetX;
        this.click_y0 = e.offsetY;
        //this.drawRectangle2(e.offsetX,e.offsetY,100,100);
        this.regionEdge = this.isOnRegionCorner(this.click_x0, this.click_y0);
        let regionId = this.isInsideRegion(this.click_x0, this.click_y0);
        if (this.isRegionSelected) {
            // check if user clicked on the region boundary
            if ( this.regionEdge[1] > 0 ) {
                if ( !this.isUserResizingRegion ) {
                    // resize region
                    if ( this.regionEdge[0] !== this.userSelRegionId ) {
                        this.userSelRegionId = this.regionEdge[0];
                    }
                    this.isUserResizingRegion = true;
                }
            } else {
                let yes = this.isInsideThisRegion(this.click_x0, this.click_y0, this.userSelRegionId);
                if (yes) {
                    if( !this.isUserMovingRegion ) {
                        this.isUserMovingRegion = true;
                        this.regionClick_x = this.click_x0;
                        this.regionClick_y = this.click_y0;
                    }
                }
                if (regionId === -1) {
                    this.isUserDrawingRegion = true;
                    this.isRegionSelected = false;
                    this.userSelRegionId = -1;
                    this.toogleAllRegionsSelection(false);
                }
            }
        } else {
            if ( regionId === -1 ) {
                // mousedown outside a region
                this.isUserDrawingRegion = true;


            } else {
                // mousedown inside a region
                // this could lead to (1) region selection or (2) region drawing
                this.isUserDrawingRegion = true;
            }
        }
        e.preventDefault();
    }
    mouseOver(e){
        this.regionCanvas.focus();
    }
    mouseUp(e){
        this.click_x1 = e.offsetX;
        this.click_y1 = e.offsetY;
        let click_dx = Math.abs(this.click_x1-this.click_x0);
        let click_dy = Math.abs(this.click_y1-this.click_y0);

        // indicates that user has finished moving a region
        if (this.isUserMovingRegion ) {
            this.isUserMovingRegion = false;
            this.regionCanvas.style.cursor = "default";

            let move_x = Math.round(this.click_x1 - this.regionClick_x);
            let move_y = Math.round(this.click_y1 - this.regionClick_y);

            if (Math.abs(move_x) > this.mouseClickTolerance || Math.abs(move_y) > this.mouseClickTolerance) {
                console.log(this.imgMetadata);
                console.log(this.canvasRegions);
                let image_attr = this.imgMetadata[this.imgId].regions[this.userSelRegionId].shape_attributes;
                let canvas_attr = this.canvasRegions[this.userSelRegionId].shape_attributes;

                let xnew = image_attr['x'] + Math.round(move_x * this.navScaleFactor);
                let ynew = image_attr['y'] + Math.round(move_y * this.navScaleFactor);
                image_attr['x'] = xnew;
                image_attr['y'] = ynew;

                canvas_attr['x'] = Math.round( image_attr['x'] / this.navScaleFactor);
                canvas_attr['y'] = Math.round( image_attr['y'] / this.navScaleFactor);
                        

                
            } else {
                let nested_region_id = this.isInsideRegion(this.click_x0, this.click_y0);
                if (nested_region_id >= 0 &&
                    nested_region_id !== this.userSelRegionId) {
                    this.userSelRegionId = nested_region_id;
                    this.isRegionSelected = true;
                    this.isUserMovingRegion = false;

                    // de-select all other regions if the user has not pressed Shift
                    if ( !e.shiftKey ) {
                        this.toogleAllRegionsSelection(false);
                    }
                    this.setRegionSelectState(nested_region_id, true);
                }
            }
            this.redrawRegCanvas();
            this.regionCanvas.focus();
            return;
        }

        // indicates that user has finished resizing a region
        if ( this.isUserResizingRegion ) {
            // _via_click(x0,y0) to _via_click(x1,y1)
            this.isUserResizingRegion = false;
            this.regionCanvas.style.cursor = "default";

            // update the region
            let region_id = this.regionEdge[0];
            let image_attr = this.imgMetadata[this.imgId].regions[region_id].shape_attributes;
            let canvas_attr = this.canvasRegions[region_id].shape_attributes;



            let d = [canvas_attr['x'], canvas_attr['y'], 0, 0];
            d[2] = d[0] + canvas_attr['width'];
            d[3] = d[1] + canvas_attr['height'];

            let mx = this.current_x;
            let my = this.current_y;
            let preserve_aspect_ratio = false;

            // constrain (mx,my) to lie on a line connecting a diagonal of rectangle


            this.rectangleUpdateCorner(this.regionEdge[1], d, mx, my, preserve_aspect_ratio);
            this.rectangleStandardizeCoordinates(d);//rect_standardize_coordinates(d);

                    let w = Math.abs(d[2] - d[0]);
                    let h = Math.abs(d[3] - d[1]);

                    image_attr['x'] = Math.round(d[0] * this.navScaleFactor);
                    image_attr['y'] = Math.round(d[1] * this.navScaleFactor);
                    image_attr['width'] = Math.round(w * this.navScaleFactor);
                    image_attr['height'] = Math.round(h * this.navScaleFactor);

                    canvas_attr['x'] = Math.round( image_attr['x'] / this.navScaleFactor);
                    canvas_attr['y'] = Math.round( image_attr['y'] / this.navScaleFactor);
                    canvas_attr['width'] = Math.round( image_attr['width'] / this.navScaleFactor);
                    canvas_attr['height'] = Math.round( image_attr['height'] / this.navScaleFactor);



            this.redrawRegCanvas();
            this.regionCanvas.focus();
            return;
        }

        // denotes a single click (= mouse down + mouse up)
        if ( click_dx < this.mouseClickTolerance ||
            click_dy < this.mouseClickTolerance ) {
            // if user is already drawing polygon, then each click adds a new point

                let region_id = this.isInsideRegion(this.click_x0, this.click_y0);
                if ( region_id >= 0 ) {
                    // first click selects region
                    this.userSelRegionId     = region_id;
                    this.isRegionSelected     = true;
                    this.isUserMovingRegion  = false;
                    this.isUserDrawingRegion = false;

                    // de-select all other regions if the user has not pressed Shift
                    if ( !e.shiftKey ) {
                        this.toogleAllRegionsSelection(false);
						if(this.canvasRegions[this.userSelRegionId].region_attributes.id != null){
							this.selectLabelRef.nativeElement.value = this.canvasRegions[this.userSelRegionId].region_attributes.id;
						}
						if(this.canvasRegions[this.userSelRegionId].region_attributes.id === null){
							this.selectLabelRef.nativeElement.value = -1;
						}
					}
                    this.setRegionSelectState(region_id, true);
                } else {
                    if ( this.isUserDrawingRegion ) {
                        // clear all region selection
                        this.isUserDrawingRegion = false;
                        this.isRegionSelected     = false;
                        this.toogleAllRegionsSelection(false);

                    } else {
                       //
                    }
                }

            this.redrawRegCanvas();
            this.regionCanvas.focus();
            return;
        }

        // indicates that user has finished drawing a new region
        if (this.isUserDrawingRegion) {

            this.isUserDrawingRegion = false;

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

            let original_img_region = new ImageRegion();
            let canvas_img_region = new ImageRegion();
            let region_dx = Math.abs(region_x1 - region_x0);
            let region_dy = Math.abs(region_y1 - region_y0);

            // newly drawn region is automatically selected
            this.toogleAllRegionsSelection(false);
            original_img_region.is_user_selected = true;
            canvas_img_region.is_user_selected = true;
            this.isRegionSelected = true;
            this.userSelRegionId = this.canvasRegions.length; // new region's id

            if ( region_dx > this.VIA_REGION_MIN_DIM ||
                region_dy > this.VIA_REGION_MIN_DIM ) { // avoid regions with 0 dim


                        let x = Math.round(region_x0 * this.navScaleFactor);
                        let y = Math.round(region_y0 * this.navScaleFactor);
                        let width  = Math.round(region_dx * this.navScaleFactor);
                        let height = Math.round(region_dy * this.navScaleFactor);
                        original_img_region.shape_attributes['name'] = 'rect';
                        original_img_region.shape_attributes['x'] = x;
                        original_img_region.shape_attributes['y'] = y;
                        original_img_region.shape_attributes['width'] = width;
                        original_img_region.shape_attributes['height'] = height;

                        canvas_img_region.shape_attributes['name'] = 'rect';
                        canvas_img_region.shape_attributes['x'] = Math.round( x / this.navScaleFactor );
                        canvas_img_region.shape_attributes['y'] = Math.round( y / this.navScaleFactor );
                        canvas_img_region.shape_attributes['width'] = Math.round( width / this.navScaleFactor );
                        canvas_img_region.shape_attributes['height'] = Math.round( height / this.navScaleFactor );
                        this.imgMetadata[this.imgId].regions.push(original_img_region);
                        this.canvasRegions.push(canvas_img_region);






            } else {
            }
            this.redrawRegCanvas();
            this.regionCanvas.focus();

            return;
        }

    }
    drawAllRegions(){
        for (let i=0; i < this.canvasRegions.length; ++i) {
            let attr = this.canvasRegions[i].shape_attributes;
            let is_selected = this.canvasRegions[i].is_user_selected;
            this.drawRectangleRegion(attr['x'], attr['y'], attr['width'], attr['height'], is_selected, this.canvasRegions[i].region_attributes.color);



        }
    }
    drawAllRegions_id(){
        for (let i=0; i < this.canvasRegions.length; ++i) {
            let attr = this.canvasRegions[i].shape_attributes;
            let is_selected = this.canvasRegions[i].is_user_selected;
            this.drawRectangleRegion(attr['x'], attr['y'], attr['width'], attr['height'], is_selected, this.canvasRegions[i].region_attributes.color)
        }
    }
    redrawRegCanvas(){
        if (this.isCurrentImageLoaded) {
            if (this.canvasRegions.length > 0 ) {


                this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
                if (this.isRegionBoundaryVisible) {
                    this.drawAllRegions();
                }

                if (this.isRegionIdVisible) {
                    this.drawAllRegions_id();
                }
            }
        }
    }
    drawRectangle(x, y, w, h){
        this.regionCtx.beginPath();
        this.regionCtx.moveTo(x  , y);
        this.regionCtx.lineTo(x+w, y);
        this.regionCtx.lineTo(x+w, y+h);
        this.regionCtx.lineTo(x  , y+h);
        this.regionCtx.closePath();
    }
    drawControlPoint(cx,cy){
        this.regionCtx.beginPath();
        this.regionCtx.arc(cx, cy, this.VIA_REGION_POINT_RADIUS, 0, 2*Math.PI, false);
        this.regionCtx.closePath();

        this.regionCtx.fillStyle = this.VIA_THEME_CONTROL_POINT_COLOR;
        this.regionCtx.globalAlpha = 1.0;
        this.regionCtx.fill();

    }
    rectangleUpdateCorner(corner_id, d, x, y, preserve_aspect_ratio) {
        if (preserve_aspect_ratio) {
            switch(corner_id) {
                case 1: // Fall-through // top-left
                case 3: // bottom-right
                    let dx3 = d[2] - d[0];
                    let dy3 = d[3] - d[1];
                    let norm3 = Math.sqrt( dx3*dx3 + dy3*dy3 );
                    let nx3 = dx3 / norm3; // x component of unit vector along the diagonal of rect
                    let ny3 = dy3 / norm3; // y component
                    let proj3 = (x - d[0]) * nx3 + (y - d[1]) * ny3;
                    let proj_x3 = nx3 * proj3;
                    let proj_y3 = ny3 * proj3;
                    // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
                    x = Math.round( d[0] + proj_x3 );
                    y = Math.round( d[1] + proj_y3 );
                    break;
                case 2: // Fall-through // top-right
                case 4: // bottom-left
                    let dx = d[2] - d[0];
                    let dy = d[1] - d[3];
                    let norm = Math.sqrt( dx*dx + dy*dy );
                    let nx = dx / norm; // x component of unit vector along the diagonal of rect
                    let ny = dy / norm; // y component
                    let proj = (x - d[0]) * nx + (y - d[3]) * ny;
                    let proj_x = nx * proj;
                    let proj_y = ny * proj;
                    // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
                    x = Math.round( d[0] + proj_x );
                    y = Math.round( d[3] + proj_y );
                    break;
            }
        }
        switch(corner_id) {
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
    rectangleStandardizeCoordinates(d){
        if ( d[0] > d[2] ) {
            // swap
            let t = d[0];
            d[0] = d[2];
            d[2] = t;
        }
        if ( d[1] > d[3] ) {
            // swap
            let t = d[1];
            d[1] = d[3];
            d[3] = t;
        }
    }
    drawRectangleRegion(x, y, w, h, is_selected,color) {
        if (is_selected) {
            this.drawRectangle(x, y, w, h);
            this.drawSubImage(x*this.navScaleFactor,y*this.navScaleFactor,w*this.navScaleFactor,h*this.navScaleFactor);
            this.regionCtx.strokeStyle = this.VIA_THEME_BOUNDARY_LINE_COLOR;
            this.regionCtx.lineWidth   = this.VIA_THEME_REGION_BOUNDARY_WIDTH/2;
            this.regionCtx.stroke();

            this.regionCtx.fillStyle   = this.VIA_THEME_SEL_REGION_FILL_COLOR;
            this.regionCtx.globalAlpha = this.VIA_THEME_SEL_REGION_OPACITY;
            this.regionCtx.fill();
            this.regionCtx.globalAlpha = 1.0;

            this.drawControlPoint(x,y);
            this.drawControlPoint(x+w, y+h);
            this.drawControlPoint(x  , y+h);
            this.drawControlPoint(x+w,   y);
        } else {
            this.drawRectangle(x, y, w, h);

            this.regionCtx.strokeStyle = this.VIA_THEME_BOUNDARY_LINE_COLOR;
            this.regionCtx.lineWidth   = this.VIA_THEME_REGION_BOUNDARY_WIDTH/2;
            this.regionCtx.stroke();

            console.log(this.userSelRegionId);
            this.regionCtx.fillStyle   = color;//this.canvasRegions[this.userSelRegionId].region_attributes.color;
            this.regionCtx.globalAlpha = this.VIA_THEME_UNSEL_REGION_OPACITY;
            this.regionCtx.fill();
            this.regionCtx.globalAlpha = 1.0;



        }
    }
    toogleAllRegionsSelection(is_selected){
        for (let i=0; i<this.canvasRegions.length; ++i) {
            this.canvasRegions[i].is_user_selected = is_selected;
            this.imgMetadata[this.imgId].regions[i].is_user_selected = is_selected;
        }
        this.isAllRegionSelected = is_selected;
    }
    setRegionSelectState(region_id, is_selected){
        this.canvasRegions[region_id].is_user_selected = is_selected;
        this.imgMetadata[this.imgId].regions[region_id].is_user_selected = is_selected;
    }
    getImageRef(image){
        let arrayOfBlob = new Array<Blob>();
        let file = new File(arrayOfBlob, image, { type: 'image' });
        this.imgMetadata[this.imgId] = new ImagaMetaData(file, file.name, file.size);
    }
    isOnRectEdge(x, y, w, h, px, py) {
        let dx0 = Math.abs(x - px);
        let dy0 = Math.abs(y - py);
        let dx1 = Math.abs(x + w - px);
        let dy1 = Math.abs(y + h - py);

        //[top-left=1,top-right=2,bottom-right=3,bottom-left=4]
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
        let regionEdge = [-1, -1]; // region_id, corner_id [top-left=1,top-right=2,bottom-right=3,bottom-left=4]

        for (let i = 0; i < this.canvasRegions.length; ++i ) {
            let attr = this.canvasRegions[i].shape_attributes;
            let result = -1;
            regionEdge[0] = i;
            result = this.isOnRectEdge(attr['x'],
                attr['y'],
                attr['width'],
                attr['height'],
                px, py);

            if (result > 0) {
                regionEdge[1] = result;
                return regionEdge;
            }
        }
        regionEdge[0] = -1;
        return regionEdge;
    }
    isInsideRegion(px,py){
        let N = this.canvasRegions.length;
        if ( N === 0 ) {
            return -1;
        }
        let start = 0;
        let end   = N;
        let del   = 1;
        let i = start;
        while ( i !== end ) {
            let yes = this.isInsideThisRegion(px, py, i);
            if (yes) {
                return i;
            }
            i = i + del;
        }
        return -1;

    }
    isInsideThisRegion(px,py,regionId){
        let attr   = this.canvasRegions[regionId].shape_attributes;
        let result = this.isInsideRect(attr['x'], attr['y'], attr['width'], attr['height'], px, py);
        return result;

    }
    isInsideRect(x, y, w, h, px, py) {
        return px > x && px < (x + w) && py > y && py < (y + h);
    }
    deleteSelectedRegion(){

        this.viewCtx.clearRect(0,0,this.viewCtx.canvas.width,this.viewCtx.canvas.height);

        let del_region_count = 0;
        if ( this.isAllRegionSelected ) {
            del_region_count = this.canvasRegions.length;
            this.canvasRegions.splice(0);
            this.imgMetadata[this.imgId].regions.splice(0);
        } else {
            let sorted_sel_reg_id = [];
            for ( let i = 0; i < this.canvasRegions.length; ++i ) {
                if ( this.canvasRegions[i].is_user_selected ) {
                    sorted_sel_reg_id.push(i);
                }
            }
            sorted_sel_reg_id.sort( function(a,b) {
                return (b-a);
            });
            for ( let i = 0; i < sorted_sel_reg_id.length; ++i ) {
                this.canvasRegions.splice( sorted_sel_reg_id[i], 1);
                this.imgMetadata[this.imgId].regions.splice( sorted_sel_reg_id[i], 1);
                del_region_count += 1;
            }
        }

        this.isAllRegionSelected = false;
        this.isRegionSelected     = false;
        this.userSelRegionId     = -1;

        if ( this.canvasRegions.length === 0 ) {
            // all regions were deleted, hence clear region canvas
            this.clearRegionCanvas(); //_via_clear_reg_canvas();
        } else {
            this.redrawRegCanvas();
        }
        this.regionCanvas.focus();



    }
    clearRegionCanvas(){

        this.regionCtx.clearRect(0, 0, this.regionCanvas.width, this.regionCanvas.height);
    }

    getImageScaleFactor(width, height, windowWidth, windowHeight){
        if (width/windowWidth > height/windowHeight){
            return width/windowWidth;
        }else{
            return height/windowHeight;
        }
    }

    loadRectanglesFromJson(){
        //TODO: load from Server JSON @andrea
    }
    drawSubImage(x,y,w,h){
        this.viewCtx.clearRect(0,0,this.viewCanvas.width, this.viewCanvas.height);
        this.viewCtx.drawImage(this.img,x,y,w,h,0,0,this.viewCanvas.width,this.viewCanvas.height);

        console.log(this.canvasRegions)
    }
    loadImage(){
        this.imgW = this.img.width;
        this.imgH = this.img.height;
        this.navScaleFactor = this.getImageScaleFactor(this.imgW,this.imgH, this.imageWindowWidth, this.imageWindowHeight);
        this.navWidth = this.imgW/this.navScaleFactor;
        this.navHeight = this.imgH/this.navScaleFactor;


        this.imageCtx.canvas.width = this.navWidth;
        this.imageCtx.canvas.height = this.navHeight;

        this.regionCtx.canvas.height = this.navHeight;
        this.regionCtx.canvas.width = this.navWidth;

        this.imageCtx.drawImage(this.img,0,0,this.imgW,this.imgH,0,0,this.imgW/this.navScaleFactor,this.imgH/this.navScaleFactor);

    }



    onResize(event:Event){
        this.getWindowSize();
    }
	

	changeRegionClass(classLabelId){
		let id = classLabelId - 1;
		
		console.log("classid: " + classLabelId);
		this.defaultLabel = this.classLabels[id];
		if(this.isRegionSelected){
			this.canvasRegions[this.userSelRegionId].region_attributes = this.classLabels[id];
			this.imgMetadata[this.imgId].regions[this.userSelRegionId].region_attributes = this.classLabels[id];
		}
	}
	
	getRequest(){
		var id = String(101);
		let url = 'http://127.0.0.1:5000/rois/' + id + "/machine";
		
		this.http.get(url).map((res: Response) => res.json()).subscribe(res => this.getRequestResults(res));
	}
	
	LoadRois(classId, x,y,width,height){
		let original_img_region = new ImageRegion();
		let canvas_img_region = new ImageRegion();

        // newly drawn region is automatically selected
        this.toogleAllRegionsSelection(false);
        original_img_region.is_user_selected = true;
        canvas_img_region.is_user_selected = true;
        this.isRegionSelected = true;
        this.userSelRegionId = this.canvasRegions.length; // new region's id

        

        original_img_region.shape_attributes['name'] = 'rect';
        original_img_region.shape_attributes['x'] = x;
        original_img_region.shape_attributes['y'] = y;
        original_img_region.shape_attributes['width'] = width;
        original_img_region.shape_attributes['height'] = height;
		original_img_region.region_attributes = this.classLabels[classId];

        canvas_img_region.shape_attributes['name'] = 'rect';
        canvas_img_region.shape_attributes['x'] = Math.round( x / this.navScaleFactor );
        canvas_img_region.shape_attributes['y'] = Math.round( y / this.navScaleFactor );
        canvas_img_region.shape_attributes['width'] = Math.round( width / this.navScaleFactor );
        canvas_img_region.shape_attributes['height'] = Math.round( height / this.navScaleFactor );
		canvas_img_region.region_attributes = this.classLabels[classId];;
        this.imgMetadata[this.imgId].regions.push(original_img_region);
        this.canvasRegions.push(canvas_img_region);
						
		this.drawAllRegions_id();
	}

	
	postRequest(){
		
		const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('authentication', `hello`);
		const options = new RequestOptions({headers: headers});
		
		this.http.post('http://127.0.0.1:5000/rois/',
		JSON.stringify(
			{ 
				"image-id": 101,
				"table": "machine", 
				"path": "somePath",
				"file-typ": "jpg", 
				"size" : 8128312,  
				"width" : 1920,    
				"height" : 20,
				"last-modified": 1527678888,
				"rois" : [{
					"id": 1,
					"x": 30,
					"y": 40,
					"w": 300,
					"h": 300,
					"class": "car",
					"recommendations":{
						"car" : 0.92,
						"dog" : 0.42,
						"bike" : 0.03
					}
				},{
					"id": 2,
					"x": 300,
					"y": 450,
					"w": 300,
					"h": 300,
					"class": "car",
					"recommendations":{
						"car" : 0.92,
						"dog" : 0.42,
						"bike" : 0.03
					}
				}]
			}
		), options)
		.subscribe(
		data => {
			alert('ok');
			console.log(data);
		}
		)
	}
	
	searchLabel(){
		var changed = false;
		if(this.searchText != null){	
			this.actualClassLabels = [];
			for(var i = 0; i < this.classLabels.length; i++){
				if(this.classLabels[i].name.includes(this.searchText)){
					this.actualClassLabels.push(this.classLabels[i]);
					changed = true;
				}
			}
		}
		
	}
	
	getRequestResults(res){
		res = res.result[0].machine[0];
		
		console.log(res.rois[0]);
		for(let i=0; i < res.rois.length;i++){
			let rois = res.rois[i];
			this.LoadRois(1, rois.x, rois.y, rois.w, rois.h);
		}
	}
	
}