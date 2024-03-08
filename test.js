import fs from 'fs'

// const huge = fs.readFileSync('./src/assets/words370k.txt', 'utf-8').split('\n')
const large = fs.readFileSync('./src/assets/words30k.txt', 'utf-8').split('\n')
// const medium = fs.readFileSync('./src/assets/words10k.txt', 'utf-8').split('\n')
const small = fs.readFileSync('./src/assets/words4.txt', 'utf-8').split('\n')

console.log('aaa', new Set(large).size)
console.log('aaa', new Set(small).size)
const largeSet = new Set(large)
const missing = new Set()
for (let word of small) {
    if (!largeSet.has(word)) missing.add(word)
}
// console.log('aaa', new Set(missing))

fs.writeFileSync('./src/assets/missing.txt', Array.from(missing).join('\n'))

// const hugeSet = new Set(huge)

// const largeExtra = new Set()
// for (let word of large) {
//     if (!hugeSet.has(word)) largeExtra.add(word)
// }

// const mediumExtra = new Set()
// for (let word of medium) {
//     if (!hugeSet.has(word)) mediumExtra.add(word)
// }

// const smallExtra = new Set()
// for (let word of medium) {
//     if (!hugeSet.has(word)) smallExtra.add(word)
// }

// console.log(Array.from(smallExtra).length)
// console.log(large.filter((w) => w.length >= 16 / 1).length)
// console.log(large.filter((w) => w.length >= 16 / 2).length)
// console.log(large.filter((w) => w.length >= 16 / 3).length)
// console.log(large.filter((w) => w.length >= 16 / 4).length)
// // console.log(Array.from(largeExtra).join('\n'))
// // console.log(huge)

// // fs.writeFileSync(
// //     './src/assets/words370kExtra.txt',
// //     Array.from(largeExtra).join('\n')
// // )
