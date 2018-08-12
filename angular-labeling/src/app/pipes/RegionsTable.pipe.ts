import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'randomcase'
})

export class RandomCasePipe implements PipeTransform {

    transform(value:string, args?:any) : string {
        let transformed = "";
        for (let i=0; i<value.length; i++){
            if(Math.random()>0.5){

            }

        }

        return transformed;
    }
}