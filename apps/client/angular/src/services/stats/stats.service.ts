import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class StatsService {
    private static LocalStorageKey = 'seqleStats'
    private static DefaultStats: Stats = {
        finished: 0,
        wordCount: {},
        letterCount: {},
        wordLengthCount: {},
    }

    public static saveStats(stats: Stats) {
        localStorage.setItem(
            StatsService.LocalStorageKey,
            JSON.stringify(stats)
        )
    }

    public static getStats(): Stats {
        const stats = localStorage.getItem(StatsService.LocalStorageKey)
        if (stats) {
            return Object.assign(StatsService.DefaultStats, JSON.parse(stats))
        } else {
            return StatsService.DefaultStats
        }
    }

    public static win(guesses: string[]) {
        const wordCount = guesses.length
        const letterCount = guesses.join('').split('').length

        const stats = this.getStats()
        stats.finished++
        stats.wordCount[wordCount] = (stats.wordCount[wordCount] || 0) + 1
        stats.letterCount[letterCount] =
            (stats.letterCount[letterCount] || 0) + 1
        for (let word of guesses) {
            const wordLength = word.length
            stats.wordLengthCount[wordLength] =
                (stats.wordLengthCount[wordLength] || 0) + 1
        }
        this.saveStats(stats)
    }
}

export type Stats = {
    finished: number
    wordCount: Record<number, number>
    letterCount: Record<number, number>
    wordLengthCount: Record<number, number>
}
