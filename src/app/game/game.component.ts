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

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.less'],
    providers: [BoardService, WordsService],
})
export class GameComponent implements OnInit {
    @ViewChild('wordInput') wordInput!: ElementRef

    static GUESSES = 5
    @Input() size: [number, number] = [4, 4]
    sizes = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20]
    isInit = false
    board: string[][] = []
    solution: string[] = []
    state: { char: string; state: number; color: string }[][] = []
    guesses: string[] = ['']
    solved: boolean = false
    colors: string[] = []

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
            row.map((cell) => ({ char: cell, state: 0, color: '' }))
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
        console.log('KEYDOWN', event)
        this.focusInput()
    }

    onInput(text: string) {
        this.refreshBoard()
    }

    refreshBoard() {
        this.clearBoard()
        BoardService.applyGuesses(this.state, this.guesses)
    }

    clearBoard() {
        for (let row of this.state) {
            for (let cell of row) {
                cell.state = 0
                cell.color = ''
            }
        }
    }

    trackByIndex(index: number) {
        return index
    }

    onEnter(event: any) {
        if (
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
        this.guesses.push('')

        this.updateColors()

        this.changeDetector.detectChanges()
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
        }
    }

    isSolved() {
        return this.state.every((row) => row.every((cell) => !!cell.state))
    }

    onSolve() {
        this.solved = true
        this.changeDetector.detectChanges()
        alert('sovled!')
    }
}
