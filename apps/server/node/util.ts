export type Brand<T, B> = T & { _brand: B }

export type Char = Brand<string, 'char'>

export function clamp(min: number, value: number, max: number): number {
    if (max < min) return min
    if (value < min) return min
    if (value > max) return max
    return value
}

export function groupBy<T>(iterable: Iterable<T>, fn: (item: T) => string | number) {
    return [...iterable].reduce<Record<string, T[]>>((groups, curr) => {
        const key = fn(curr)
        const group = groups[key] ?? []
        group.push(curr)
        return { ...groups, [key]: group }
    }, {})
}

export function randomChoice<T>(arr: T[]): T | undefined {
    if (!arr?.length) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
}

export function* range(start: number, end: number, step = 1) {
    let i = start
    while (i !== end) {
        yield i
        i += step
    }
}

export function array2D<T>(width: number, height: number, fill?: (pos: { x: number; y: number }) => T): T[][] {
    return new Array(height)
        .fill(null)
        .map((_, y) => new Array(width).fill(null).map((_, x) => fill?.({ x, y }) ?? (null as T)))
}

export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        // And swap it with the current element.
        ;[array[currentIndex], array[randomIndex]] = [array[randomIndex]!, array[currentIndex]!]
    }
    return array
}
