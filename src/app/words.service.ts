import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

export type DictionaryEntry = { isWord?: boolean } & {
    [key: string]: DictionaryEntry
}

@Injectable({
    providedIn: 'root',
})
export class WordsService {
    public static words: Record<
        'small' | 'medium' | 'huge',
        { list: string[]; dictionary: DictionaryEntry }
    > = {} as any
    public static ready: Promise<boolean>
    private static resolveOnReady: (
        value: boolean | PromiseLike<boolean>
    ) => void

    constructor(private http: HttpClient) {
        console.log('CONSTR WORD')

        WordsService.ready = new Promise(async (res, rej) => {
            WordsService.words = {
                small: await this.loadWords('words3k.txt'),
                medium: await this.loadWords('words10k.txt'),
                huge: await this.loadWords('words370k.txt'),
            }
            res(true)
        })
    }

    private async loadWords(fileName: string) {
        const data = await firstValueFrom(
            this.http.get(`assets/${fileName}`, { responseType: 'text' })
        )
        console.log('data', data)
        const words = data.split(/[\r\n]+/)

        const dictionary: DictionaryEntry = {}
        for (let word of words) {
            let dict = dictionary
            for (let char of word) {
                if (!dict[char]) dict[char] = {}
                dict = dict[char]
            }
            dict.isWord = true
        }

        return { list: words, dictionary }
    }

    public static getRandomWordOfLength(
        wordList: keyof typeof WordsService.words,
        length: number
    ) {
        return WordsService.getRandomWord(
            WordsService.words[wordList].list.filter(
                (word) => word.length === length && !/\-/.test(word)
            )
        )
    }

    public static getRandomWord(
        words: string[] = WordsService.words.small.list
    ) {
        const alphaWords = words.filter((word) => !/[^\w]/.test(word))
        return alphaWords[Math.floor(alphaWords.length * Math.random())]
    }
}
