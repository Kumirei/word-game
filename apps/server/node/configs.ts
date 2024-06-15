import type { BoardOptions } from './board.js'
import { Words } from './words.js'

export const Configs: Record<string, Partial<BoardOptions>> = {
    default: {
        vocabulary: Words['100k'],
        solutionVocabulary: Words['3k'],
    },
    '4x4': {
        wordLengthMin: 4,
        wordLengthMax: 4,
        solvableLength: 3,
        vocabulary: Words['100k'],
        solutionVocabulary: Words['4letters'],
    },
    '5x5': {
        wordLengthMin: 4,
        wordLengthMax: 7,
        solvableLength: 5,
    },
    '6x6': {
        wordLengthMin: 4,
    },
    '7x7': {
        wordLengthMin: 4,
    },
    '8x8': {
        wordLengthMin: 4,
    },
    '9x9': {
        wordLengthMin: 4,
    },
    '10x10': {
        wordLengthMin: 4,
    },
} as const
