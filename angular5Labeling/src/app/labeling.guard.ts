import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AnnotationService} from './services/annotation.service';
import {Observable} from 'rxjs';

@Injectable()
export class LabelingGuard implements CanActivate {
  annotationService: AnnotationService;
  constructor(private router: Router, @Inject(AnnotationService) annotationService: AnnotationService) {
    this.annotationService = annotationService;
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.annotationService.imageRegions.image.source_id) {
      return true;
    }
    this.router.navigate(['/'], {queryParams: {returnUrl: '/'}});
    return false;
  }

}

