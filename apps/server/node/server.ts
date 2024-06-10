import express from 'express'
import { createBoard } from './board.js'
import { Words } from './words.js'

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello Word')
})

// Get today's board
app.get('/today', (req, res) => {
    // What is today???
    res.send("You asked for today's board")
})

// Get a new board
app.get('/new', (req, res) => {
    const board = createBoard({
        width: 4,
        height: 4,
        wordLengthMin: 4,
        wordLengthMax: 4,
        solvableLength: 3,
        vocabulary: Words['100k'],
        solutionVocabulary: Words['4letters'],
    })
    res.json(board).send()
})

// Check if a word is valid
app.post('/word', (req, res) => {
    const word = req.query['w']
    if (!word) {
        res.status(400).send('No word provided')
        return
    }

    res.send(`You asked if "${word}" is valid`)
})

app.listen(port, () => {
    console.log(`Word Game listening on port ${port}`)
})
