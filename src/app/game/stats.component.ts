import { Component, OnInit } from '@angular/core'
import { StatsService } from '../stats.service'

@Component({
    selector: 'stats',
    template: `
        <div>
            <label>Finished</label>
            <span> {{ finished }}</span>
        </div>
        <div>
            <label>Word Counts</label>
            <span *ngFor="let count of wordCount"> {{ count }}</span>
        </div>
        <div>
            <label>Total Letter Counts</label>
            <span *ngFor="let count of letterCount"> {{ count }}</span>
        </div>
        <div>
            <label>Word Length Counts</label>
            <span *ngFor="let count of wordLengthCount"> {{ count }}</span>
        </div>
    `,
    styles: [``],
})
export class StatsComponent implements OnInit {
    finished: number = 0
    wordCount: number[] = []
    letterCount: number[] = []
    wordLengthCount: number[] = []

    ngOnInit(): void {
        const stats = StatsService.getStats()
        this.finished = stats.finished

        const mostWords = Math.max(...Object.keys(stats.wordCount).map(Number))
        this.wordCount = new Array(mostWords - 1).fill(0)
        for (let [key, val] of Object.entries(stats.wordCount))
            this.wordCount[Number(key) - 1] = val

        const mostLetters = Math.max(
            ...Object.keys(stats.letterCount).map(Number)
        )
        this.letterCount = new Array(mostLetters).fill(0)
        for (let [key, val] of Object.entries(stats.letterCount))
            this.letterCount[Number(key) - 1] = val

        const longestWord = Math.max(
            ...Object.keys(stats.letterCount).map(Number)
        )
        this.wordLengthCount = new Array(longestWord).fill(0)
        for (let [key, val] of Object.entries(stats.wordLengthCount))
            this.wordLengthCount[Number(key) - 1] = val

        console.log('STATS', stats)
    }
}
