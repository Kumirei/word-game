import { NgFor } from '@angular/common'
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
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
            :host {
                overflow: hidden;
                pointer-events: none;
            }

            .twinkle {
                opacity: 0;
                transition: opacity
                    calc(var(--twinkle-transition-duration) * 1ms) ease-in-out;
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
export class Twinkles implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input() density: number = 1 / 10_000 // Twinkles per pixel
    @Input() onTime: number = 1000 // MS
    @Input()
    @HostBinding('style.--twinkle-transition-duration')
    transitionTime: number = 500 // MS
    @Input() offTime: number = 1000 // MS

    @ViewChildren('twinkle') twinkleElems!: QueryList<ElementRef>

    twinkles: Twinkle[] = []
    resizeObserver!: ResizeObserver

    constructor(
        private elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.resizeObserver = new ResizeObserver((entries) => {
            this.createTwinkles()
            this.startTwinkling()
        })

        this.resizeObserver.observe(this.elementRef.nativeElement)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['count']) this.createTwinkles()
    }

    ngAfterViewInit(): void {
        this.startTwinkling()
    }

    ngOnDestroy(): void {
        this.stopTwinkling()
        this.resizeObserver.unobserve(this.elementRef.nativeElement)
    }

    createTwinkles() {
        this.stopTwinkling()
        const pixels =
            this.elementRef.nativeElement.offsetHeight *
            this.elementRef.nativeElement.offsetWidth
        const count = Math.floor(pixels * this.density)

        this.twinkles = new Array(count).fill(null).map((_, i) => ({ i }))
        this.changeDetector.detectChanges()
    }

    startTwinkling() {
        for (let twinkle of this.twinkles) {
            twinkle.timeout = setTimeout(
                () => this.twinkleOn(twinkle),
                Math.random() * this.offTime // Randomize time before first twinkle
            ) as unknown as number
        }
    }

    stopTwinkling() {
        for (let twinkle of this.twinkles) clearTimeout(twinkle.timeout)
    }

    twinkleOn(twinkle: Twinkle) {
        const elem = this.twinkleElems.get(twinkle.i)
        if (elem) {
            elem.nativeElement.classList.add('on')
            elem.nativeElement.style.left = Math.random() * 100 + '%'
            elem.nativeElement.style.top = Math.random() * 100 + '%'
        }
        twinkle.timeout = setTimeout(
            () => this.twinkleOff(twinkle),
            this.transitionTime + this.onTime
        ) as unknown as number
    }

    twinkleOff(twinkle: Twinkle) {
        const elem = this.twinkleElems.get(twinkle.i)
        elem?.nativeElement.classList.remove('on')
        twinkle.timeout = setTimeout(
            () => this.twinkleOn(twinkle),
            this.offTime * (Math.random() + 0.5) // Randomize time off delay a bit
        ) as unknown as number
    }
}

type Twinkle = { timeout?: number; i: number }
