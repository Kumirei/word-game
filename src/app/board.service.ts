import { Injectable } from '@angular/core'
import { DictionaryEntry, WordsService } from './words.service'
import { group, shuffle } from './util'
import * as d3 from 'd3'

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    public static DELTAS = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
    ]
    constructor(private WordService: WordsService) {}

    public static getRandomBoard(size: [number, number] = [4, 4]) {
        const wordLength = size[0] * size[1]
        let grid: string[][]
        let possibleWords: Record<string, Set<string>>
        let possibleWordsSmall: Record<string, Set<string>>
        do {
            // Try to get a word which can cover the whole board
            // let letters = WordsService.getRandomWordOfLength(wordLength) || ''
            let letters = ''
            // If that is not possible, use random words
            if (!letters) {
                while (!letters || letters.length < wordLength) {
                    letters = (letters + WordsService.getRandomWord()).slice(
                        0,
                        wordLength
                    )
                }
            }

            grid = group(shuffle(letters.split('')), size[0])
            possibleWords = BoardService.findWordsInGrid('huge', grid)
            possibleWordsSmall = BoardService.findWordsInGrid('medium', grid)
            console.log('WORD', letters)
        } while (!this.isSolvable(grid, possibleWordsSmall)) // Make sure it's solvable at all

        let solution = BoardService.findASolution(grid, possibleWordsSmall)

        const solutionWords = solution
            .map((a) => a[0])
            .sort((a, b) => b.length - a.length)
        return {
            grid,
            possibleWords: Object.keys(possibleWords),
            solution: solutionWords,
        }
    }

    public static isSolvable(
        grid: string[][],
        words: Record<string, Set<string>>
    ) {
        const cellCount = grid[0].length * grid.length
        // Prune word list
        // const cellList = Object.values(words).filter((cells) => cells.size > 2) // Only accept solutions with no 2 cell words
        const cellList = Object.entries(words)
            .filter((word) => word[0].length > 2)
            .map((word) => word[1]) // Only accept solutions with no 2 letter words

        // Collect possible cells in a set
        const possibleCells = new Set<string>()
        for (let cells of cellList) {
            for (let cell of cells) possibleCells.add(cell)
            if (possibleCells.size === cellCount) return true // All cells covered, no need to check further
        }
        return false // If it were possible it would have returned above
    }

    public static findASolution(
        grid: string[][],
        words: Record<string, Set<string>>
    ) {
        const cellCount = grid[0].length * grid.length
        // Sort by number of cells
        const wordList = Object.entries(words)
            .sort((a, b) => b[1].size - a[1].size)
            // .filter((word) => word[1].size > 2) // Only keep words which cover 3 or more cells
            .filter((word) => word[0].length > 2) // Only keep words which are at least 3 characters

        // Try all words as first word
        // Thereafter just try the best one until grid is filled
        let solutions = []
        outer: for (let word of wordList) {
            const solution: [string, Set<string>][] = [word]
            const covered = new Set<string>(word[1]) // Set of all filled cells
            let i = 0
            while (covered.size < cellCount) {
                // console.log('solution', { solution, covered, i })

                i++
                if (i > cellCount) continue outer // No solution possible
                // Sort according to most new cells covered
                wordList.sort(
                    (a, b) =>
                        this.setDiff(b[1], covered).size -
                        this.setDiff(a[1], covered).size
                )
                // Just pick the best one
                solution.push(wordList[0])
                for (let cell of wordList[0][1]) covered.add(cell)
            }
            solutions.push(solution)
        }

        // We have a few solutions, now see which one is the best
        solutions.sort((a, b) => {
            // If solutions are of different lengths, pick the shortest
            if (a.length !== b.length) return a.length - b.length
            // If same length, then pick the one with the fewest doubles (fewest total characters)
            return (
                a.map((a) => a[0]).join('').length -
                b.map((b) => b[0]).join('').length
            )
        })

        console.log('SOLUTIONS', solutions)

        return solutions[0]
    }

    public static setDiff<T extends Set<any>>(setA: T, setB: T) {
        return new Set([...setA].filter((a) => !setB.has(a)))
    }

    public static intersection<T extends Set<any>>(setA: T, setB: T) {
        return new Set([...setA].filter((a) => setB.has(a)))
    }

    public static findWordsInGrid(
        wordList: keyof typeof WordsService.words,
        grid: string[][]
    ): Record<string, Set<string>> {
        const foundWords: Record<string, Set<string>> = {}
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                BoardService.findWords(
                    WordsService.words[wordList].dictionary,
                    grid,
                    '',
                    x,
                    y,
                    foundWords
                )
            }
        }
        return foundWords
    }

    public static findWords(
        dictionary: DictionaryEntry,
        grid: string[][],
        prefix: string,
        x: number,
        y: number,
        foundWords: Record<string, Set<string>>,
        cells: Set<string> = new Set()
    ) {
        // Prefix includes character at [x,y]
        if (dictionary.isWord) {
            if (!foundWords[prefix]) foundWords[prefix] = new Set(cells)
            // If we have already found this word elsewhere, just add the cells
            else foundWords[prefix] = new Set([...foundWords[prefix], ...cells])
        }

        const neighbors = BoardService.getNeighbors(grid, x, y)
        for (let [nx, ny] of neighbors) {
            const char = grid[ny][nx]
            if (char in dictionary) {
                const key = `${nx}/${ny}`
                cells.add(key)
                BoardService.findWords(
                    dictionary[char],
                    grid,
                    prefix + char,
                    nx,
                    ny,
                    foundWords,
                    cells
                )
                cells.delete(key)
            }
        }
    }

    public static applyGuesses(
        board: { char: string; state: number; color: string }[][],
        guesses: string[]
    ) {
        for (let i = 0; i < guesses.length; i++) {
            const guess = guesses[i]
            // Find start of word, then traverse all possible paths to create word
            for (let y = 0; y < board.length; y++) {
                for (let x = 0; x < board[y].length; x++) {
                    if (board[y][x].char !== guess[0]) continue
                    BoardService.applyGuess(
                        board,
                        i + 1,
                        guess,
                        x,
                        y,
                        guesses.length
                    )
                }
            }
        }
    }

    public static getNeighbors(board: any[][], x: number, y: number) {
        return BoardService.DELTAS.map(([dx, dy]) => [x + dx, y + dy]).filter(
            ([x, y]) => board[y]?.[x]
        )
    }

    public static applyGuess(
        board: { char: string; state: number; color: string }[][],
        state: number,
        guess: string,
        x: number,
        y: number,
        guessCount: number
    ): boolean {
        if (!guess) return true
        const cell = board[y]?.[x]
        if (!cell || cell.char !== guess[0]) return false

        const makesWord = BoardService.getNeighbors(board, x, y)
            .map(([nx, ny]) =>
                this.applyGuess(
                    board,
                    state,
                    guess.slice(1),
                    nx,
                    ny,
                    guessCount
                )
            )
            .some((a) => a)
        if (!cell.state && makesWord) {
            cell.state = state
            console.log('SATE', x, y, state)

            const green = d3.rgb(136, 255, 141)
            const red = d3.rgb(255, 136, 136)
            cell.color = d3.interpolate(
                green,
                red
            )(state / ((board[0].length * board.length) / 3))
        }
        return makesWord
    }
}
