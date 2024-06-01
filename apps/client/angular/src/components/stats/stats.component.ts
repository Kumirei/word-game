import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core'
import { StatsService } from '../../services/stats/stats.service'
import { ChartComponent, ChartData } from '../chart/chart.component'

@Component({
    selector: 'stats',
    template: `
        <h2 class="header">Stats</h2>
        <div class="finished">Games: {{ finished }}</div>
        <div class="stat">
            <label>Words Used</label>
            <sixten-chart [data]="wordCount" />
        </div>
        <div class="stat">
            <label>Word Lengths</label>
            <sixten-chart [data]="wordLengthCount" />
        </div>
        <div class="stat">
            <label>Total Letters Used</label>
            <sixten-chart [data]="letterCount" />
        </div>
    `,
    styles: [
        `
            :host {
                position: relative;

                display: grid;
                height: 100%;
                grid-template-rows: auto auto 1fr 1fr 1fr;
            }

            .header {
                text-align: center;
                font-size: 2em;
            }

            .finished,
            label {
                font-size: 1.5em;
                font-weight: bold;
            }

            .stat {
                display: grid;
                grid-template-rows: auto 1fr;
                text-align: center;
            }
        `,
    ],
    standalone: true,
    imports: [ChartComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
})
export class StatsComponent implements OnInit {
    finished: number = 0
    wordCount: ChartData = []
    letterCount: ChartData = []
    wordLengthCount: ChartData = []

    ngOnInit(): void {
        const stats = StatsService.getStats()
        this.finished = stats.finished

        this.wordCount = this.statsToChartData(stats.wordCount)

        this.letterCount = this.statsToChartData(stats.letterCount)

        this.wordLengthCount = this.statsToChartData(stats.wordLengthCount)
    }

    statsToChartData(
        stats: ReturnType<typeof StatsService.getStats>['wordCount']
    ): ChartData {
        const max = Math.max(...Object.keys(stats).map(Number))

        const data: ChartData = new Array(max - 1)
            .fill(null)
            .map((_, i) => ({ label: String(i + 1), value: 0 }))
        for (let [count, times] of Object.entries(stats)) {
            data[Number(count) - 1] = { label: count, value: times }
        }

        return data
    }
}
