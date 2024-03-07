import { NgFor } from '@angular/common'
import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    QueryList,
    SimpleChanges,
    ViewChildren,
} from '@angular/core'

@Component({
    selector: 'twinkles',
    standalone: true,
    imports: [NgFor],
    template: `
        <div #twinkle *ngFor="let _ of twinkles" class="twinkle"></div>
    `,
    styles: [
        `
            .twinkle {
                opacity: 0;
                transition: opacity 1s ease-in-out;
                width: 1px;
                height: 1px;
                background-color: white;
                position: absolute;
                box-shadow: 0 0 3px 1px white;
            }

            .twinkle.on {
                opacity: 1;
            }
        `,
    ],
})
export class Twinkles implements OnInit, AfterViewInit {
    @Input() count: number = 10
    @Input() onTime: number = 1000 // MS
    @Input() offTime: number = 1000 // MS

    @ViewChildren('twinkle') twinkleElems!: QueryList<ElementRef>

    twinkles: any[] = []

    ngOnInit(): void {
        this.twinkles = new Array(this.count).fill(null).map((_) => ({
            offset: Math.random() * this.offTime,
        }))
    }

    ngAfterViewInit(): void {
        console.log('AAAA', this.twinkleElems.first)

        for (let elem of this.twinkleElems) {
            setTimeout(() => {
                this.twinkle(elem)
            }, Math.random() * this.offTime)
        }
    }

    twinkle(elem: ElementRef) {
        // Toggle on/off
        if (elem.nativeElement.classList.contains('on')) {
            elem.nativeElement.classList.remove('on')
            setTimeout(
                () => this.twinkle(elem),
                this.offTime + (this.offTime / 2) * Math.random()
            )
        } else {
            elem.nativeElement.classList.add('on')
            elem.nativeElement.style.left = Math.random() * 100 + '%'
            elem.nativeElement.style.top = Math.random() * 100 + '%'
            setTimeout(() => this.twinkle(elem), this.onTime)
        }
    }
}
