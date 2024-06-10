import { array2D, groupBy, randomChoice, range, shuffle } from './util.js'

export type Vocabulary = string[]

export type Board = {
    solution: string[]
    letters: string[][]
}

export type BoardOptions = {
    width: number
    height: number
    vocabulary: Vocabulary
    wordLengthMin: number
    wordLengthMax: number
    solutionVocabulary?: Vocabulary // A subset of the full vocabulary used to create the board
    solvableLength?: number // Should be solvable in this many words. E.G. official solution is 4 words, but it can be solved in 3
}

export type Coord = { x: number; y: number }

export type Snake = {
    parts: Set<SnakePart>
    mouth: SnakePart
    butt: SnakePart
}

export type SnakePart = {
    snake: Snake
    pos: Coord
    next?: SnakePart
    prev?: SnakePart
}

export type Trie = {
    isWord: boolean
    suffixes: Record<string, Trie>
}

export type WordCoverage = {
    word: string
    coverage: Coord[]
}

export function createBoard(options: BoardOptions): Board {
    const nest = createSnakeNest(options)

    while (true) {
        const board = replaceSnakesWithWords(options, nest)
        if (!options.solvableLength) return board

        const solution = findASolution(options, board)
        if (solution.length <= options.solvableLength) {
            return board
        }
    }
}

export function findASolution(options: Pick<BoardOptions, 'vocabulary' | 'width' | 'height'>, board: Board): string[] {
    // const trie = createTrie(options.vocabulary)

    const words: WordCoverage[] = options.vocabulary.map((word) => ({
        word,
        coverage: evaluateWord(board.letters, word),
    }))
    const cells: Set<Set<WordCoverage>> = new Set()
    const coverage: Set<WordCoverage>[][] = array2D(options.width, options.height, () => {
        const cell: Set<WordCoverage> = new Set()
        cells.add(cell)
        return cell
    })
    for (const word of words) {
        for (const pos of word.coverage) {
            coverage[pos.y]![pos.x]!.add(word)
        }
    }

    const solution: string[] = []
    while (cells.size) {
        const candidates: Set<WordCoverage> = new Set()
        for (const cell of cells) {
            for (const word of cell) {
                candidates.add(word)
            }
        }

        let bestWords: WordCoverage[] = []
        let bestScore = 0
        for (const word of candidates) {
            let cellsCovered = 0
            let cellsWords = 0
            for (const cell of cells) {
                if (cell.has(word)) cellsCovered++
                cellsWords += cell.size
            }
            const score = cellsCovered / cellsWords

            // if (score > bestScore || (score === bestScore && word.word.length < bestWord.word.length)) {
            if (score === bestScore) bestWords.push(word)
            else if (score > bestScore) {
                bestScore = score
                bestWords = [word]
            }
        }

        const bestWord = randomChoice(bestWords)
        solution.push(bestWord!.word)

        // Prune cells
        for (const pos of bestWord!.coverage) {
            cells.delete(coverage[pos.y]![pos.x]!)
        }
    }

    return solution
}

export function evaluateWord(grid: string[][], word: string): Coord[] {
    const coverage: Set<string> = new Set()

    const queue: { pos: Coord; w: number; path: Coord[] }[] = []
    for (const y of range(0, grid.length)) {
        for (const x of range(0, grid[0]!.length)) {
            if (grid[y]![x]! !== word[0]) continue
            const pos = { x, y }
            queue.push({ pos, w: 0, path: [pos] })
        }
    }

    while (queue.length) {
        const { pos, w, path } = queue.pop()!
        if (w >= word.length) continue

        const char = grid[pos.y]?.[pos.x]
        if (!char || char !== word[w]) continue

        if (w === word.length - 1) {
            for (const p of path) coverage.add(`${p.x},${p.y}`)
            continue
        }

        for (const neighbor of getNeighbors(pos)) {
            queue.push({ pos: neighbor, w: w + 1, path: [...path, neighbor] })
        }
    }

    return Array.from(coverage).map((key) => {
        const [x, y] = key.split(',').map(Number)
        return { x, y } as Coord
    })
}

export function createTrie(words: string[]): Trie {
    function defaultTrie(): Trie {
        return {
            isWord: false,
            suffixes: {},
        }
    }
    const trie: Trie = defaultTrie()
    for (const word of words) {
        let curr = trie
        for (const char of word) {
            if (!curr.suffixes[char]) curr.suffixes[char] = defaultTrie()
            curr = curr.suffixes[char]!
        }
        curr.isWord = true
    }
    return trie
}

export function createSnakeNest(options: BoardOptions): SnakePart[][] {
    const snakesByLength: Map<number, Set<Snake>> = new Map()
    for (const l of range(0, options.width * options.height)) snakesByLength.set(l, new Set())
    const grid: SnakePart[][] = array2D(options.width, options.height, (pos) => {
        const part: SnakePart = { pos } as SnakePart
        const snake: Snake = { parts: new Set([part]), mouth: part, butt: part }
        snakesByLength.get(1)?.add(snake)
        part.snake = snake
        return part
    })

    let smallest = 1
    while (smallest < options.wordLengthMin) {
        smallest = Array.from(snakesByLength.entries()).reduce(
            (min, [count, snakes]) => (snakes.size ? Math.min(count, min) : min),
            Number.MAX_SAFE_INTEGER
        )

        const snake = randomChoice([...snakesByLength.get(smallest)!])!
        const merge = getMergeCandidates(grid, snake).reduce((shortest, candidate) =>
            candidate[1].snake.parts.size < shortest[1].snake.parts.size ? candidate : shortest
        )

        if (merge) {
            const [a, b] = merge
            snakesByLength.get(b.snake.parts.size)?.delete(b.snake)
            snakesByLength.get(a.snake.parts.size)?.delete(a.snake)
            const newSnake = joinSnakes(a, b)
            snakesByLength.get(newSnake.parts.size)?.add(newSnake)

            // If longer than should be, split
            if (snake.parts.size > options.wordLengthMax) {
                snakesByLength.get(snake.parts.size)?.delete(snake)
                const [a, b] = splitSnake(snake, options.wordLengthMin - 1)
                snakesByLength.get(a.parts.size)?.add(a)
                snakesByLength.get(b.parts.size)?.add(b)
            }
        } else {
            // Could not find a suitable merge candidate, so split a neighbor instead
            const split = getSplitCandidates(grid, snake).reduce((longest, candidate) =>
                candidate[1].snake.parts.size > longest[1].snake.parts.size ? candidate : longest
            )
            const toSplit = split[1].snake
            snakesByLength.get(toSplit.parts.size)?.delete(toSplit)
            const [a, b] = splitSnake(toSplit, distanceFromMouth(toSplit, split[1]))
            snakesByLength.get(snake.parts.size)?.delete(snake)
            const newSnake = joinSnakes(split[0], split[1])
            snakesByLength.get(b.parts.size)?.add(b)
            snakesByLength.get(newSnake.parts.size)?.add(newSnake)
        }
    }

    return grid
}

export function replaceSnakesWithWords(options: BoardOptions, grid: SnakePart[][]): Board {
    const snakes: Set<Snake> = new Set()
    for (const row of grid) {
        for (const part of row) {
            snakes.add(part.snake)
        }
    }

    const board: Board = {
        solution: [],
        letters: array2D(options.width, options.height, () => ''),
    }

    const vocabulary = options.solutionVocabulary ?? options.vocabulary
    const wordsByLength = groupBy(vocabulary, (word) => word.length)
    for (const snake of snakes) {
        const wordOptions = wordsByLength[snake.parts.size]
        if (!wordOptions?.length) throw `No words of length ${snake.parts.size}`
        const word = randomChoice(wordOptions)!
        board.solution.push(word)

        let curr = snake.mouth
        let w = 0
        while (curr) {
            board.letters[curr.pos.y]![curr.pos.x] = word[w]!
            curr = curr.next!
            w++
        }
    }

    return board
}

export function distanceFromMouth(snake: Snake, part: SnakePart): number {
    let curr = snake.mouth
    let count = 0
    while (curr !== part) {
        count++
        curr = curr.next!
    }

    return count
}

export function getSplitCandidates(grid: SnakePart[][], snake: Snake): [SnakePart, SnakePart][] {
    const candidates: [SnakePart, SnakePart][] = []
    for (const end of [snake.butt, snake.mouth]) {
        for (const neighbor of shuffle(getNeighbors(end.pos))) {
            const part = grid[neighbor.y]?.[neighbor.x]
            if (!part || part.snake === snake) continue
            candidates.push([end, part])
        }
    }

    return candidates
}

export function getMergeCandidates(grid: SnakePart[][], snake: Snake): [SnakePart, SnakePart][] {
    const candidates: [SnakePart, SnakePart][] = []

    for (const end of [snake.butt, snake.mouth]) {
        for (const neighbor of shuffle(getNeighbors(end.pos))) {
            const part = grid[neighbor.y]?.[neighbor.x]
            if (!part || part.snake === snake) continue
            if (part.snake.butt !== part && part.snake.mouth !== part) continue // Only ends
            candidates.push([end, part])
        }
    }

    return candidates
}

export function splitSnake(snake: Snake, at: number): [Snake, Snake] {
    const divide = Math.floor(at)
    const a: Snake = { parts: new Set(), mouth: snake.mouth } as Snake
    const b: Snake = { parts: new Set(), butt: snake.butt } as Snake

    let j = 0
    let curr = snake.mouth
    while (curr) {
        const next = curr.next

        if (j <= divide) {
            a.parts.add(curr)
            curr.snake = a
        } else {
            b.parts.add(curr)
            curr.snake = b
        }
        if (j === divide) {
            a.butt = curr

            curr.next = undefined
        } else if (j === divide + 1) {
            curr.prev = undefined
            b.mouth = curr
        }

        j++
        curr = next!
    }

    return [a, b]
}

export function joinSnakes(a: SnakePart, b: SnakePart): Snake {
    if (!a.next) a.next = b
    else a.prev = b
    if (!b.next) b.next = a
    else b.prev = a

    const newMouth = otherEnd(a.snake, a)
    const newButt = otherEnd(b.snake, b)

    a.snake.mouth = newMouth
    a.snake.butt = newButt

    for (const part of b.snake.parts) {
        part.snake = a.snake
        a.snake.parts.add(part)
    }

    alignSnake(a.snake)

    return a.snake
}

export function otherEnd(snake: Snake, end: SnakePart) {
    return snake.mouth === end ? snake.butt : snake.mouth
}

export function alignSnake(snake: Snake) {
    let curr = snake.mouth
    let prev = curr.next ? curr.prev : curr.next
    while (true) {
        const next = curr.next === prev ? curr.prev : curr.next
        curr.next = next
        curr.prev = prev
        prev = curr
        curr = next!
        if (!next) break
    }
}

function getNeighbors(pos: Coord): Coord[] {
    const deltas = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
    ]
    return deltas.map(([dx, dy]) => ({ x: pos.x + dx!, y: pos.y + dy! }))
}
