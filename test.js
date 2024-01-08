import fs from 'fs'

// const wordList = fs.readFileSync('./words370k.txt', 'utf-8')
// const wordList = fs.readFileSync('./words10k.txt', 'utf-8')
const wordList = fs.readFileSync('./src/assets/words3k.txt', 'utf-8')
const words = wordList.split(/[\r\n]+/)

const dictionary = {}
for (let word of words) {
    let dict = dictionary
    for (let char of word) {
        if (!dict[char]) dict[char] = {}
        dict = dict[char]
    }
    dict.isWord = true
}

const gridSize = [3, 3]
const gridCells = gridSize[0] * gridSize[1]

const starterWords = words.filter((word) => word.length === gridCells)
const starterWord =
    starterWords[Math.floor(starterWords.length * Math.random())]
const grid = group(shuffle(starterWord.split('')), 3)

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

const possibleWords = findWordsInGrid(dictionary, grid)

console.log({ starterWord, grid, possibleWords })

function findWordsInGrid(dictionary, grid) {
    const foundWords = []
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            findWords(dictionary, grid, '', x, y, foundWords)
        }
    }
    return foundWords
}

function findWords(dictionary, grid, prefix, x, y, foundWords) {
    // Prefix includes character at [x,y]
    if (dictionary.isWord) foundWords.push(prefix)

    const neighbors = deltas
        .map(([dx, dy]) => [x + dx, y + dy])
        .filter(([x, y]) => grid[y]?.[x])
    for (let [nx, ny] of neighbors) {
        const char = grid[ny][nx]
        if (char in dictionary)
            findWords(dictionary[char], grid, prefix + char, nx, ny, foundWords)
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

function group(arr, groupSize) {
    return arr.reduce((groups, item, i) => {
        if (i % groupSize === 0) groups.push([])
        groups[groups.length - 1].push(item)
        return groups
    }, [])
}
