import {
    type AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    type OnChanges,
    type OnDestroy,
    type OnInit,
    type SimpleChanges,
    ViewEncapsulation,
    input,
    viewChildren,
} from '@angular/core'

@Component({
    selector: 'twinkles',
    standalone: true,
    imports: [],
    template: `
        @for (_ of twinkles; track _) {
            <div #twinkle class="twinkle"></div>
        }
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
    host: {
        '[style.--twinkle-transition-duration]': 'transitionTime()',
    },
})
export class Twinkles implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    density = input<number>(1 / 10_1000) // Twinkles per pixel
    onTime = input(1000) // MS
    transitionTime = input(500) // MS
    offTime = input(1000) // MS

    twinkleElems = viewChildren<ElementRef>('twinkle')

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
        const count = Math.floor(pixels * this.density())

        this.twinkles = new Array(count).fill(null).map((_, i) => ({ i }))
        this.changeDetector.detectChanges()
    }

    startTwinkling() {
        for (let twinkle of this.twinkles) {
            twinkle.timeout = setTimeout(
                () => this.twinkleOn(twinkle),
                Math.random() * this.offTime() // Randomize time before first twinkle
            ) as unknown as number
        }
    }

    stopTwinkling() {
        for (let twinkle of this.twinkles) clearTimeout(twinkle.timeout)
    }

    twinkleOn(twinkle: Twinkle) {
        const elem = this.twinkleElems()[twinkle.i]
        if (elem) {
            elem.nativeElement.classList.add('on')
            elem.nativeElement.style.left = Math.random() * 100 + '%'
            elem.nativeElement.style.top = Math.random() * 100 + '%'
        }
        twinkle.timeout = setTimeout(
            () => this.twinkleOff(twinkle),
            this.transitionTime() + this.onTime()
        ) as unknown as number
    }

    twinkleOff(twinkle: Twinkle) {
        const elem = this.twinkleElems()[twinkle.i]
        elem?.nativeElement.classList.remove('on')
        twinkle.timeout = setTimeout(
            () => this.twinkleOn(twinkle),
            this.offTime() * (Math.random() + 0.5) // Randomize time off delay a bit
        ) as unknown as number
    }
}

type Twinkle = { timeout?: number; i: number }
