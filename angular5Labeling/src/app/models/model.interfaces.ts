export interface Roi {
  id: number;
  label: Label;
  is_user_selected: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  proposedLabels: Label[];
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface ImageMeta {

  height: number;
  width: number;
  filename: string;
  source_id: string;
  //console.log(this.source_id);
  last_modified: number;
  sha256: string;
  format: string;
}

export interface ImageRegionsInterface {
  image: ImageMeta;
  rois: Roi[];
}

export interface PostAnnotations {
  imageId: number;
  table: string;
  path: string;
  fileTyp: string;
  size: number;
  width: number;
  height: number;
  lastModified: number;
  rois: Roi[];
}

export interface ColorCodes {
  id: number;
  color: string;
}

/*

   image-id: 121,
   table: human,
   path: somePath,
   file-typ: jpg,
   size : 8128312,
   width : 1920,
   height : 20,
  last-modified: 1527678888,
  rois : [{
      id: 1,
      x: 0,
      y: 0,
      w: 300,
      h: 300,
      class: car,
      recommendations:{
          car : 0.92,
          dog : 0.42,
          bike : 0.03
      }
  },{
      id: 2,
      x: 0,
      y: 0,
      w: 300,
      h: 300,
      class: car,
      recommendations:{
          car : 0.92,
          dog : 0.42,
          bike : 0.03
      }
  }]
}
 */
