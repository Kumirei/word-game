import {
    alignSnake,
    createBoard,
    createTrie,
    evaluateWord,
    findASolution,
    joinSnakes,
    otherEnd,
    splitSnake,
    type Snake,
    type SnakePart,
} from './board.js'
import { describe, expect, it } from 'vitest'
import { Words } from './words.js'

function createSnake() {
    const snake: Snake = { parts: new Set([]), i: 0 } as any
    const mouth: SnakePart = { snake: snake, pos: { x: 0, y: 0 } }
    const middle: SnakePart = { snake: snake, pos: { x: 1, y: 0 } }
    const butt: SnakePart = { snake: snake, pos: { x: 2, y: 0 } }

    snake.parts.add(mouth)
    snake.parts.add(middle)
    snake.parts.add(butt)

    snake.mouth = mouth
    snake.butt = butt

    mouth.next = middle
    middle.prev = mouth
    middle.next = butt
    butt.prev = middle

    return snake
}

function isWellFormed(snek: Snake): boolean {
    const visited: Set<SnakePart> = new Set()
    let curr = snek.mouth
    while (curr) {
        if (visited.has(curr)) return false
        curr = curr.next!
    }
    return true
}

it('Can create a new board with solution length', () => {
    const board = createBoard({
        height: 4,
        width: 4,
        wordLengthMin: 4,
        wordLengthMax: 4,
        solvableLength: 3,
        vocabulary: Words['100k'],
        solutionVocabulary: Words['3k'],
    })
})

it('Can find a solution', () => {
    const board = [
        ['n', 'g', 'i', 'n'],
        ['a', 'b', 's', 's'],
        ['r', 't', 'o', 'p'],
        ['e', 'd', 'i', 't'],
    ]

    const vocabulary = [
        'tang',
        'nibs',
        'redo',
        'edit',
        'spit',
        'i',
        'a',
        'o',
        'tip',
        'top',
        'in',
        'bang',
        'tider',
        'bared',
    ]

    expect(
        findASolution({ width: board[0]!.length, height: board.length, vocabulary }, { letters: board, solution: [] })
    )
})

it('Can evaluate word', () => {
    const board = [
        ['t', 'e', 's', 't'],
        ['s', 'e', 'x', 't'],
        ['x', 'x', 's', 'x'],
        ['x', 't', 'x', 'x'],
    ]

    expect(evaluateWord(board, 'test')).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 3 },
        { x: 3, y: 1 },
        { x: 0, y: 1 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 0 },
    ])
})

it('Can build trie', () => {
    const trie = createTrie(['be', 'bee', 'bend'])
    expect(trie).toEqual({
        isWord: false,
        suffixes: {
            b: {
                isWord: false,
                suffixes: {
                    e: {
                        isWord: true,
                        suffixes: {
                            e: {
                                isWord: true,
                                suffixes: {},
                            },
                            n: {
                                isWord: false,
                                suffixes: {
                                    d: {
                                        isWord: true,
                                        suffixes: {},
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
})

it('Can split sneks', () => {
    const snek = createSnake()
    const [a, b] = splitSnake(snek, snek.parts.size / 2)

    // Part A
    expect(a.parts.size).toBe(2)

    expect(a.mouth).toBe(snek.mouth)
    expect(a.butt).toBe(snek.mouth.next)

    expect(a.mouth.prev).toBe(undefined)
    expect(a.mouth.next).toBe(a.butt)
    expect(a.butt.prev).toBe(snek.mouth)
    expect(a.butt.next).toBe(undefined)

    // Part B
    expect(b.parts.size).toBe(1)

    expect(b.mouth).toBe(snek.butt)
    expect(b.butt).toBe(snek.butt)

    expect(b.mouth.prev).toBe(undefined)
    expect(b.mouth.next).toBe(undefined)
    expect(b.butt.prev).toBe(undefined)
    expect(b.butt.next).toBe(undefined)
})

it('Can join sneks', () => {
    const mouthToButt: Snake = joinSnakes(createSnake().mouth, createSnake().butt)
    const mouthToMouth: Snake = joinSnakes(createSnake().mouth, createSnake().mouth)
    const buttToButt: Snake = joinSnakes(createSnake().butt, createSnake().butt)
    const buttToMouth: Snake = joinSnakes(createSnake().butt, createSnake().mouth)

    expect(isWellFormed(mouthToButt)).toBe(true)
    expect(isWellFormed(mouthToMouth)).toBe(true)
    expect(isWellFormed(buttToButt)).toBe(true)
    expect(isWellFormed(buttToMouth)).toBe(true)
})

it('Can find other end', () => {
    const snek: Snake = createSnake()

    expect(otherEnd(snek, snek.mouth)).toBe(snek.butt)
    expect(otherEnd(snek, snek.butt)).toBe(snek.mouth)
})

it('Can fix alignments', () => {
    const snek: Snake = createSnake()
    const middle = snek.mouth.next!
    middle.prev = snek.butt
    middle.next = snek.mouth

    alignSnake(snek)

    expect(snek.mouth.prev).toBe(undefined)
    expect(snek.mouth.next).toBe(middle)
    expect(middle.prev).toBe(snek.mouth)
    expect(middle.next).toBe(snek.butt)
    expect(snek.butt.prev).toBe(middle)
    expect(snek.butt.next).toBe(undefined)
})
