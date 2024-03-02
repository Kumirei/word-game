import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core'
import { BoardService } from '../board.service'
import { WordsService } from '../words.service'
import * as d3 from 'd3'
import { delay } from '../util'

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.less'],
    providers: [BoardService, WordsService],
})
export class GameComponent implements OnInit {
    @ViewChild('wordInput') wordInput!: ElementRef
    @ViewChildren('cell') cells!: QueryList<ElementRef>

    static GUESSES = 5
    @Input() size: [number, number] = [4, 4]
    sizes = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20]
    isInit = false
    board: string[][] = []
    solution: string[] = []
    state: {
        char: string
        state: number
        color: string
        step: Record<number, number>
    }[][] = []
    guesses: string[] = ['']
    solved: boolean = false
    colors: string[] = []
    valid: boolean = false

    constructor(
        private changeDetector: ChangeDetectorRef,
        private BoardService: BoardService,
        private WordService: WordsService
    ) {}

    async ngOnInit(): Promise<void> {
        await WordsService.ready

        this.newBoard()
    }

    newBoard() {
        const { grid, solution } = BoardService.getRandomBoard(this.size)

        this.board = grid
        this.state = this.board.map((row) =>
            row.map((cell) => ({
                char: cell,
                state: 0,
                color: '',
                step: {},
            }))
        )
        this.solution = solution
        this.guesses = ['']
        this.isInit = true
        this.updateColors()
        this.solved = false
        this.changeDetector.detectChanges()
    }

    @HostListener('document:keydown', ['$event'])
    onType(event: KeyboardEvent) {
        this.focusInput()
    }

    onInput(text: string) {
        this.refreshBoard()
    }

    refreshBoard() {
        this.clearBoard()
        this.valid = BoardService.applyGuesses(this.state, this.guesses)
    }

    clearBoard() {
        for (let row of this.state) {
            for (let cell of row) {
                cell.state = 0
                cell.color = ''
                cell.step = {}
            }
        }
    }

    trackByIndex(index: number) {
        return index
    }

    onEnter(event: any) {
        if (
            !this.valid ||
            !this.guesses.every((guess) =>
                WordsService.isWord(guess.toLowerCase())
            )
        ) {
            const elem = this.wordInput.nativeElement
            elem.classList.add('wrongAnswer')
            setTimeout(() => elem.classList.remove('wrongAnswer'), 250)
            return
        }
        if (this.isSolved()) return this.onSolve()

        const totalChars = this.guesses.join('').length
        const guess = this.guesses.at(-1) || ''
        this.bumpChars(totalChars - guess.length, totalChars)
        this.guesses.push('')

        this.updateColors()

        this.changeDetector.detectChanges()
    }

    async bumpChars(start: number, end: number) {
        const bumps: Record<number, [number, number, number][]> = {}
        for (let i = start; i <= end; i++) bumps[i] = []

        for (let y = 0; y < this.state.length; y++) {
            for (let x = 0; x < this.state[y].length; x++) {
                const cell = this.state[y][x]
                for (let [s, multiplicity] of Object.entries(cell.step)) {
                    const step = Number(s)
                    if (step >= start && step <= end)
                        bumps[step].push([x, y, multiplicity])
                }
            }
        }

        for (let step = start; step <= end; step++) {
            for (let [x, y, m] of bumps[step]) this.bumpChar(x, y, m)
            await delay(200)
        }
    }

    async bumpChar(x: number, y: number, multiplicity: number) {
        const cell = this.cells.find((cell) => {
            const data = cell.nativeElement.dataset
            const ex = Number(data.x)
            const ey = Number(data.y)
            return x === ex && y === ey
        })
        cell?.nativeElement.classList.add('bump')
        cell?.nativeElement.style.setProperty('--bounce-amplitude', 1)
        await delay(400)
        cell?.nativeElement.classList.remove('bump')
        cell?.nativeElement.style.removeProperty('--bounce-amplitude')
    }

    updateColors() {
        const green = d3.rgb(136, 255, 141)
        const red = d3.rgb(255, 136, 136)
        this.colors = new Array(this.guesses.length).fill(null).map((_, i) => {
            return d3.interpolate(green, red)(i / this.guesses.length)
        })
    }

    focusInput() {
        this.wordInput.nativeElement.focus()
    }

    onBackspace(event: Event) {
        if (!this.guesses.at(-1) && this.guesses.length !== 1) {
            this.guesses.pop()
            event.preventDefault() // Don't delete on previous word
            this.refreshBoard()
        }
    }

    isSolved() {
        return this.state.every((row) => row.every((cell) => !!cell.state))
    }

    onSolve() {
        this.solved = true
        this.changeDetector.detectChanges()
        // alert('sovled!')
        this.keepBumping()
    }

    async keepBumping() {
        const chars = this.guesses.join('').length
        while (this.solved) {
            let bumped = 0
            for (let word of this.guesses) {
                await this.bumpChars(bumped, bumped + word.length - 1)
                await delay(500)
                bumped += word.length
            }
            await delay(2000)
        }
    }

    removeGuess(index: number) {
        if (this.solved) return
        this.guesses.splice(index, 1)
        this.refreshBoard()
    }

    onCellClick(cell: any) {
        this.guesses[this.guesses.length - 1] += cell.char
        this.onInput(this.guesses[this.guesses.length - 1])
    }

    onDelete() {
        const guess = this.guesses[this.guesses.length - 1]
        if (this.guesses.length > 1 && guess === '') {
            this.guesses.pop()
        } else this.guesses[this.guesses.length - 1] = guess.slice(0, -1)
        this.refreshBoard()
    }
}
