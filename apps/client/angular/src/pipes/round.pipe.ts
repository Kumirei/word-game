import { Pipe, type PipeTransform } from '@angular/core'

@Pipe({
    name: 'round',
    pure: true,
    standalone: true,
})
export class RoundPipe implements PipeTransform {
    transform(value: number, decimals: number) {
        const scale = 10 ** decimals
        return Math.round(value * scale) / scale
    }
}
