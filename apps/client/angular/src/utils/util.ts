export function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        swap(array, i, j)
    }
    return array
}

export function swap<A extends unknown[]>(array: A, a: number, b: number) {
    const temp = array[a]
    array[a] = array[b]
    array[b] = temp
}

export function group<T>(arr: T[], groupSize: number): T[][] {
    return arr.reduce((groups, item, i) => {
        if (i % groupSize === 0) groups.push([])
        groups[groups.length - 1]?.push(item)
        return groups
    }, [] as T[][])
}

export function arrayRandom<T extends unknown>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function delay(ms: number = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomNumberBetween(start: number, end: number) {
    return Math.floor(Math.random() * (end + 1 - start)) + start
}
