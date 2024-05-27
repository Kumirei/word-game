import { Component, OnInit } from '@angular/core'
import { StatsService } from '../stats.service'
import { ChartComponent } from '../chart.component'

@Component({
    selector: 'stats',
    template: `
        <h2 class="header">Stats</h2>
        <div class="finished">Games: {{ finished }}</div>
        <div class="stat">
            <label>Words Used</label>
            <sixten-chart [data]="wordCount"></sixten-chart>
        </div>
        <div class="stat">
            <label>Word Lengths</label>
            <sixten-chart [data]="wordLengthCount"></sixten-chart>
        </div>
        <div class="stat">
            <label>Total Letters Used</label>
            <sixten-chart [data]="letterCount"></sixten-chart>
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
})
export class StatsComponent implements OnInit {
    finished: number = 0
    wordCount: ChartComponent['data'] = []
    letterCount: ChartComponent['data'] = []
    wordLengthCount: ChartComponent['data'] = []

    ngOnInit(): void {
        const stats = StatsService.getStats()
        this.finished = stats.finished

        this.wordCount = this.statsToChartData(stats.wordCount)

        this.letterCount = this.statsToChartData(stats.letterCount)

        this.wordLengthCount = this.statsToChartData(stats.wordLengthCount)

        console.log('STATS', stats)
    }

    statsToChartData(
        stats: ReturnType<typeof StatsService.getStats>['wordCount']
    ): ChartComponent['data'] {
        const max = Math.max(...Object.keys(stats).map(Number))

        const data: ChartComponent['data'] = new Array(max - 1)
            .fill(null)
            .map((_, i) => ({ label: String(i + 1), value: 0 }))
        for (let [count, times] of Object.entries(stats)) {
            data[Number(count) - 1] = { label: count, value: times }
        }

        console.log('STAT', { stats, max, data })

        return data
    }
}
