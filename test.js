import fs from 'fs'

const huge = fs.readFileSync('./src/assets/words370k.txt', 'utf-8').split('\n')
const large = fs.readFileSync('./src/assets/words30k.txt', 'utf-8').split('\n')

const hugeSet = new Set(huge)

const largeExtra = new Set()
for (let word of large) {
    if (!hugeSet.has(word)) largeExtra.add(word)
}

console.log(Array.from(largeExtra).length)
// console.log(Array.from(largeExtra).join('\n'))
// console.log(huge)

// fs.writeFileSync(
//     './src/assets/words370kExtra.txt',
//     Array.from(largeExtra).join('\n')
// )
