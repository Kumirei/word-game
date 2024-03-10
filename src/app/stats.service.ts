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
    }

    public static saveStats(stats: Stats) {
        localStorage.setItem(
            StatsService.LocalStorageKey,
            JSON.stringify(stats)
        )
    }

    public static getStats(): Stats {
        const stats = localStorage.getItem(StatsService.LocalStorageKey)
        return (stats && JSON.parse(stats)) || StatsService.DefaultStats
    }

    public static win(guesses: string[]) {
        const wordCount = guesses.length
        const letterCount = new Set(guesses.join('').split('')).size
        const stats = this.getStats()
        stats.finished++
        stats.wordCount[wordCount] = (stats.wordCount[wordCount] || 0) + 1
        stats.letterCount[letterCount] =
            (stats.letterCount[letterCount] || 0) + 1
        this.saveStats(stats)
        console.log('stats', stats)
    }
}

export type Stats = {
    finished: number
    wordCount: Record<number, number>
    letterCount: Record<number, number>
}
