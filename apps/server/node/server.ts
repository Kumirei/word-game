import { Configs } from './configs.js'
import express from 'express'
import { createBoard } from './board.js'
import { Words } from './words.js'
import { DB } from './db.js'

const app = express()
const port = 3000

// Get today's board
app.get('/today', (req, res) => {
    const width = Number(req.query['w']) || 4
    const height = Number(req.query['h']) || 4

    if (height > 10 || width > 10 || height <= 0 || width <= 0) {
        res.status(400).send('Invalid width or height')
    }

    const today = new Date().toISOString().slice(0, 10)
    const board = DB.getBoardByDate(today, width, height)

    if (!board) {
        const board = createBoard({
            width,
            height,
            wordLengthMin: Math.min(width, height),
            vocabulary: Words['100k'],
            solutionVocabulary: Words['3k'],
            ...Configs[`${width}x${height}`],
        })

        DB.insertBoard(today, board)

        res.json(board).send()
        return
    }

    res.json({
        solution: board.solution.split(','),
        letters: board.letters.split(';').map((row) => row.split(',')),
    }).send()
})

// Check if a word is valid
const validWords = new Set(Words['100k'])
app.post('/word/validate', (req, res) => {
    const word = req.query['w'] as string
    if (!word) {
        res.status(400).send('No word provided')
        return
    }

    const valid = validWords.has(word)
    res.send(valid)
})

app.post('/word/suggest/add', (req, res) => {
    const word = req.query['w'] as string
    if (!word) {
        res.status(400).send('No word provided')
        return
    }

    if (validWords.has(word)) return res.send('Already allowed')

    DB.addSuggestion('add', word)
    res.send('Suggestion added')
})

app.post('/word/suggest/remove', (req, res) => {
    const word = req.query['w'] as string
    if (!word) {
        res.status(400).send('No word provided')
        return
    }

    if (!validWords.has(word)) return res.send('Already not allowed')

    DB.addSuggestion('remove', word)
    res.send('Suggestion added')
})

app.listen(port, () => {
    console.log(`Word Game listening on port ${port}`)
})
