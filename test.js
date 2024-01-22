import fs from 'fs'

const huge = fs.readFileSync('./src/assets/words370k.txt', 'utf-8').split('\n')
const large = fs.readFileSync('./src/assets/words30k.txt', 'utf-8').split('\n')
const medium = fs.readFileSync('./src/assets/words10k.txt', 'utf-8').split('\n')
const small = fs.readFileSync('./src/assets/words3k.txt', 'utf-8').split('\n')

const hugeSet = new Set(huge)

const largeExtra = new Set()
for (let word of large) {
    if (!hugeSet.has(word)) largeExtra.add(word)
}

const mediumExtra = new Set()
for (let word of medium) {
    if (!hugeSet.has(word)) mediumExtra.add(word)
}

const smallExtra = new Set()
for (let word of medium) {
    if (!hugeSet.has(word)) smallExtra.add(word)
}

console.log(Array.from(smallExtra).length)
console.log(huge.includes('tit'))
// console.log(Array.from(largeExtra).join('\n'))
// console.log(huge)

// fs.writeFileSync(
//     './src/assets/words370kExtra.txt',
//     Array.from(largeExtra).join('\n')
// )
