import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'maxNumber'
})

export class MaxNumberPipe implements PipeTransform {
    transform(value: number, maxNumber: number): string {
        if (value <= maxNumber) {
            return value.toString();
        } else {
            return maxNumber + '+';
        }
    }
}
