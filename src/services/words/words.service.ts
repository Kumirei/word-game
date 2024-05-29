import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { arrayRandom } from '../../utils/util'

export type DictionaryEntry = { isWord?: boolean } & {
    [key: string]: DictionaryEntry
}

@Injectable({
    providedIn: 'root',
})
export class WordsService {
    public static words: Record<
        'large' | 'four',
        // 'small' | 'medium' | 'large' | 'huge',
        { list: string[]; dictionary: DictionaryEntry }
    > = {} as any
    public static ready: Promise<boolean>
    private static resolveOnReady: (
        value: boolean | PromiseLike<boolean>
    ) => void

    constructor(private http: HttpClient) {
        WordsService.ready = new Promise(async (res, rej) => {
            WordsService.words = {
                // small: await this.loadWords('words3k.txt'),
                // medium: await this.loadWords('words10k.txt'),
                large: await this.loadWords('words30k.txt'),
                four: await this.loadWords('words4.txt'),
                // huge: await this.loadWords('words370k.txt'),
            }
            res(true)
        })
        window.WordsService = WordsService
    }

    private async loadWords(fileName: string) {
        const data = await firstValueFrom(
            this.http.get(`assets/${fileName}`, { responseType: 'text' })
        )
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
        words: string[] = WordsService.words.large.list
    ) {
        const alphaWords = words.filter((word) => !/[^\w]/.test(word))
        return alphaWords[Math.floor(alphaWords.length * Math.random())]
    }

    public static isWord(word: string) {
        let dict = WordsService.words.large.dictionary
        for (let char of word) dict = dict?.[char]
        return !!dict?.isWord
    }

    // Gets a list of random words with a combined number of total letters
    // where each word has a minimum number of letters
    public static getRandomWords(totalChars: number, minChars: number) {
        let wordList = WordsService.words.large.list.filter(
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
                    'large',
                    totalChars - chars
                )

            words.push(word)
            chars += word.length
        }

        return words
    }

    public static getRandomWordsOfLength(
        totalChars: number,
        wordCount: number
    ) {
        const charsPerWordCeil = Math.ceil(totalChars / wordCount)
        const charsPerWordFloor = Math.floor(totalChars / wordCount)
        const words = []
        let chars = 0
        const wordListCeil = WordsService.words.large.list.filter(
            (word) => word.length === charsPerWordCeil
        )
        const wordListFloor = WordsService.words.large.list.filter(
            (word) => word.length === charsPerWordFloor
        )
        while (chars < totalChars) {
            const wordLength = Math.ceil(
                (totalChars - chars) / (wordCount - words.length)
            )
            const word = arrayRandom(
                wordLength === charsPerWordCeil ? wordListCeil : wordListFloor
            )
            words.push(word)
            chars += word.length
        }

        return words
    }
}
