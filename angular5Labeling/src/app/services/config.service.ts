import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnnotationService} from './annotation.service';

@Injectable()


export class ConfigService {
  VIA_REGION_POINT_RADIUS       = 2;
  VIA_THEME_REGION_BOUNDARY_WIDTH = 0.5;
  VIA_THEME_BOUNDARY_LINE_COLOR   = '#1a1a1a';
  VIA_THEME_SEL_REGION_FILL_COLOR = '#fff';
  VIA_THEME_SEL_REGION_OPACITY    = 0.5;
  VIA_THEME_UNSEL_REGION_OPACITY = 0.2;
  VIA_THEME_CONTROL_POINT_COLOR   = '#ff0000';
  VIA_REGION_MIN_DIM            = 3;

}

