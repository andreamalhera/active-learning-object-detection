import {ImageMeta, Roi} from './model.interfaces';

export class ImageRegions {
  scaleFactor: number;
  image: ImageMeta;
  rois: Roi[];
}

