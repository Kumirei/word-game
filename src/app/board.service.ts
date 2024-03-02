import { Injectable } from '@angular/core'
import { DictionaryEntry, WordsService } from './words.service'
import { group, randomNumberBetween, shuffle } from './util'
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
        let solution
        let grid
        let aSolution: [string, Set<string>][]
        do {
            solution = new Array(4)
                .fill(null)
                .map(
                    WordsService.getRandomWord.bind(
                        this,
                        WordsService.words.four.list
                    )
                )
            grid = BoardService.createGridWithWords(size, solution)
            console.log('SOLUTION', solution)

            const possibleWords = BoardService.findWordsInGrid('large', grid)
            aSolution = BoardService.findASolution(grid, possibleWords)
            console.log(
                'aSolution',
                aSolution.map((a) => a[0])
            )
        } while (aSolution.length >= 4)

        return {
            grid,
            solution,
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
        console.log('WORDS', wordList)

        outer: for (let word of wordList.slice(0, 1)) {
            const solution: [string, Set<string>][] = [word]
            const covered = new Set<string>(word[1]) // Set of all filled cells
            let i = 0
            while (covered.size < cellCount) {
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

        return solutions[0]
    }

    public static setDiff<T extends Set<any>>(setA: T, setB: T) {
        return new Set([...setA].filter((a) => !setB.has(a)))
    }

    public static intersection<T extends Set<any>>(setA: T, setB: T) {
        return new Set([...setA].filter((a) => setB.has(a)))
    }

    public static findWordsInGrid(
        wordList: keyof typeof WordsService.words | 'custom',
        grid: string[][],
        customWordList?: string[]
    ): Record<string, Set<string>> {
        let dictionary =
            wordList === 'custom'
                ? WordsService.makeDictionary(customWordList || []).dictionary
                : WordsService.words[wordList].dictionary
        const foundWords: Record<string, Set<string>> = {}
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                BoardService.findWords(dictionary, grid, '', x, y, foundWords)
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
        board: {
            char: string
            state: number
            color: string
            step: Record<number, number>
        }[][],
        guesses: string[]
    ) {
        let chars = 0
        let lastGuessPossible = false
        for (let i = 0; i < guesses.length; i++) {
            const guess = guesses[i].toLowerCase()
            // Find start of word, then traverse all possible paths to create word
            for (let y = 0; y < board.length; y++) {
                for (let x = 0; x < board[y].length; x++) {
                    if (board[y][x].char !== guess[0]) continue
                    const ok = BoardService.applyGuess(
                        board,
                        i + 1,
                        guess.toLowerCase(),
                        x,
                        y,
                        guesses.length,
                        chars
                    )
                    if (ok && i === guesses.length - 1) lastGuessPossible = true
                }
            }
            chars += guess.length
        }
        return lastGuessPossible
    }

    public static getNeighbors(board: any[][], x: number, y: number) {
        return BoardService.DELTAS.map(([dx, dy]) => [x + dx, y + dy]).filter(
            ([x, y]) => board[y]?.[x]
        )
    }

    public static getNeighbors2(x: number, y: number) {
        return BoardService.DELTAS.map(([dx, dy]) => [x + dx, y + dy])
    }

    public static applyGuess(
        board: {
            char: string
            state: number
            color: string
            step: Record<number, number>
        }[][],
        state: number,
        guess: string,
        x: number,
        y: number,
        guessCount: number,
        step: number // number of already applied characters
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
                    guessCount,
                    step + 1
                )
            )
            .some((a) => a)
        if (makesWord) {
            cell.state = state
            cell.step[step] = (cell.step[step] || 0) + 1
        }
        return makesWord
    }

    public static doesWordCoverGrid(grid: string[][], word: string) {
        const gridSize = grid.length * grid[0].length
        const words = BoardService.findWordsInGrid('custom', grid, [word])

        return words[word]?.size === gridSize
    }

    public static createGridWithSolution(
        size: [number, number],
        letters: string
    ) {
        const grid = this.getEmptyGrid(size)

        const x = Math.floor(Math.random() * size[0])
        const y = Math.floor(Math.random() * size[1]) // Random starting position
        this.placeSolutionOnGrid(grid, new Set(), letters, x, y)
        return grid
    }

    private static createGridWithWords(
        size: [number, number],
        words: string[]
    ) {
        let states = [this.getEmptyGrid(size)]
        for (let w = 0; w < words.length; true) {
            const word = words[w]
            const state = states[w]
            const { ok, grid } = this.placeWordOnGrid(
                this.copyGrid(state),
                word
            )

            if (ok) {
                // Next word
                states.push(this.copyGrid(grid))
                w++
            } else {
                // Start over
                states = [this.getEmptyGrid(size)]
                w = 0
            }
        }

        return states[states.length - 1]
    }

    private static logBoard(board: string[][]) {
        console.log(
            ' ' +
                new Array(board[0].length)
                    .fill(null)
                    .map((_, i) => i)
                    .join('')
        )
        for (let y = 0; y < board.length; y++) {
            console.log(
                y + board[y].map((cell) => (cell === '' ? ' ' : cell)).join('')
            )
        }
    }

    private static allRemainingConnected(grid: string[][]) {
        // Iterate over grid and flood fill from all empty. If two unvisited empties are found, boooo
        const visited = new Set<string>()
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] !== '') continue
                // const key = `${x},${y}`
                // if (visited.size && !visited.has(key)) return false // BOOOO
                this.floodFillEmpty(grid, visited, x, y)
                return visited.size === this.findEmpty(grid).length
            }
        }
        return true // Yay, after first flood fill, no more unvisited empties were found
    }

    private static floodFillEmpty(
        grid: string[][],
        visited: Set<string>,
        x: number,
        y: number
    ) {
        if (grid[y]?.[x] === undefined) return // Out of bounds
        if (grid[y][x] !== '') return // Only interested in empties
        const key = `${x},${y}`
        if (visited.has(key)) return // Already visited
        visited.add(key)

        for (let [nx, ny] of this.getNeighbors2(x, y)) {
            this.floodFillEmpty(grid, visited, nx, ny)
        }
    }

    private static placeWordOnGrid(grid: string[][], word: string) {
        // Find remaining cells
        const empty = shuffle(this.findEmpty(grid))
        const original = this.copyGrid(grid)

        for (let [x, y] of empty) {
            // Choose one at random as a starting point
            // const [x, y] = empty[Math.floor(Math.random() * empty.length)]
            const placed = this.placeLettersOnGrid(grid, word, x, y)
            const open = placed && this.allRemainingConnected(grid)
            if (placed && open) return { ok: true, grid } // Done
            else grid = this.copyGrid(original)
        }
        return { ok: false, grid }
    }

    private static placeLettersOnGrid(
        grid: string[][],
        letters: string,
        x: number,
        y: number
    ): boolean {
        if (!letters) return true // Done
        if (grid[y]?.[x] === undefined) return false // Out of bounds
        if (grid[y][x] !== '') return false // Already occupied

        grid[y][x] = letters[0]

        const neighbors = this.getNeighbors2(x, y)
        for (let [nx, ny] of neighbors) {
            if (this.placeLettersOnGrid(grid, letters.slice(1), nx, ny))
                return true
        }

        grid[y][x] = '' // Didn't work out, reset
        return false
    }

    private static findEmpty(grid: string[][]) {
        const empty: [number, number][] = []
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === '') empty.push([x, y])
            }
        }
        return empty
    }

    private static copyGrid(grid: string[][]) {
        return grid.map((row) => row.map((cell) => cell))
    }

    private static placeSolutionOnGrid(
        grid: string[][],
        placed: Set<string>,
        letters: string,
        x: number,
        y: number
    ) {
        const key = `${x},${y}`
        if (placed.has(key)) return
        if (grid[y]?.[x] === undefined) return false

        grid[y][x] = letters[0]
        placed.add(key)

        if (placed.size === grid[0].length * grid.length) return true

        for (let [nx, ny] of BoardService.getNeighbors2(x, y)) {
            if (
                this.placeSolutionOnGrid(grid, placed, letters.slice(1), nx, ny)
            )
                return true
        }

        placed.delete(key)
        grid[y][x] = ''
        return false
    }

    private static getEmptyGrid(size: [number, number]) {
        return new Array(size[1])
            .fill(null)
            .map((row) => new Array(size[0]).fill(''))
    }
}
