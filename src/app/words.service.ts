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
        // console.log('CONSTR WORD')

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
        // console.log('data', data)
        const words = data.split(/[\r\n]+/)

        return WordsService.makeDictionary(words)
    }

    public static makeDictionary(wordList: string[]) {
        const dictionary: DictionaryEntry = {}
        for (let word of wordList) {
            let dict = dictionary
            for (let char of word) {
                if (!dict[char]) dict[char] = {}
                dict = dict[char]
            }
            dict.isWord = true
        }

        return { list: wordList, dictionary }
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

    public static isWord(word: string) {
        let dict = WordsService.words.huge.dictionary
        for (let char of word) dict = dict?.[char]
        return !!dict?.isWord
    }

    // Gets a list of random words with a combined number of total letters
    // where each word has a minimum number of letters
    public static getRandomWords(totalChars: number, minChars: number) {
        let wordList = WordsService.words.medium.list.filter(
            (word) => word.length >= minChars
        )
        const words = []
        let chars = 0
        while (chars < totalChars) {
            wordList = wordList.filter(
                (word) => word.length <= totalChars - chars
            )
            let word = wordList[Math.floor(Math.random() * wordList.length)]
            if (!word && totalChars - chars < minChars)
                word = WordsService.getRandomWordOfLength(
                    'medium',
                    totalChars - chars
                )

            words.push(word)
            chars += word.length
        }

        return words
    }
}
