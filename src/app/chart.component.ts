import { AfterViewInit, Component, Input, OnInit } from '@angular/core'
import { RoundPipe } from './round.pipe'
import * as d3 from 'd3'

@Component({
    selector: 'sixten-chart',
    templateUrl: './chart.component.html',
    styles: [
        `
            :host {
                display: grid;
                grid-template-rows: 1fr auto;
            }

            .flexWrapper {
                display: flex;
            }

            .data {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
                gap: 0.5em;
                flex-grow: 1;
                border-bottom: 1px solid;
                border-color: rgb(255 169 169 / 50%);
            }

            .bar {
                display: flex;
                justify-content: end;
                flex-direction: column;
            }

            .bar > label {
                text-align: center;
            }

            .fill {
                height: var(--height);
                background-color: var(--background);
            }

            .x-legend {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
                text-align: center;
                gap: 0.5em;
                padding-block: 0.5em;
            }
        `,
    ],
    standalone: true,
    imports: [RoundPipe],
})
export class ChartComponent implements OnInit {
    @Input({ required: true }) data: { label: string; value: number }[] = []
    max: number = 1
    ticks = new Array(11).fill(null).map((_, i) => (10 - i) / 10)
    colors: string[] = []

    static index = 0
    id: string

    constructor() {
        this.id = `chart-${ChartComponent.index}`
        ChartComponent.index++
    }

    ngOnInit(): void {
        console.log('DATA', this.data)
        this.max = Math.max(...this.data.map((item) => item.value))
        const green = d3.hsl(540, 1.0, 0.8)
        // const green = d3.rgb(203, 104, 228)
        // const red = d3.rgb(130, 205, 234)
        const red = d3.hsl(288, 1.0, 0.72)

        this.colors = new Array(this.data.length).fill(null).map((_, i) => {
            const weight =
                this.data.length === 1 ? 0 : i / (this.data.length - 1)
            return d3.interpolate(green, red)(weight)
        })
    }
}
