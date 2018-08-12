import { Injectable } from '@angular/core';
import { LabelClasses } from '../models/LabelClasses';

@Injectable()
export class ClasslabelService {


    getClasses() {
        return [
            new LabelClasses(1, 'car', '#123456' ),
            new LabelClasses(2, 'bicycle', '#123456' ),
            new LabelClasses(3, 'building', '#123456' ),
            new LabelClasses(4, 'pedestrian', '#123456' ),
            new LabelClasses(5, 'road-sign', '#123456' ),
            new LabelClasses(6, 'class6', '#123456' ),
            new LabelClasses(7, 'class7', '#123456' ),
            new LabelClasses(8, 'class8', '#123456' ),
            new LabelClasses(9, 'class9', '#123456' ),
            new LabelClasses(10, 'class10', '#123456' ),
        ];
    }

}

