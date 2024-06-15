import sqlite, { type Database } from 'better-sqlite3'
import { QUERIES } from './db_queries.js'
import type { Board } from './board.js'

const db = sqlite('squiggle.db')

export namespace DB {
    export type BoardRow = {
        id: number
        date: string
        width: number
        height: number
        solution: string
        letters: string
    }

    export function getBoards(): BoardRow[] {
        return db.prepare(QUERIES.boards).all() as BoardRow[]
    }

    export function getBoardByDate(date: string, width: number, height: number): BoardRow {
        return db.prepare(QUERIES.boardByDate).get({ date, width, height }) as BoardRow
    }

    export function insertBoard(date: string, board: Board) {
        const width = board.letters[0]?.length || 0
        const height = board.letters.length || 0
        const solution = board.solution.join(',')
        const letters = board.letters.map((row) => row.join(',')).join(';')
        db.prepare(QUERIES.insertBoard).run({ date, width, height, solution, letters })
    }

    export function addSuggestion(suggestion: 'add' | 'remove', word: string) {
        db.prepare(QUERIES.insertSuggestion).run({ suggestion, word, status: 'pending' })
    }
}
