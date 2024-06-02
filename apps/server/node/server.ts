import express from 'express'

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
    res.send('You asked for a brand new board')
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
