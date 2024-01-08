import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core'
import { BoardService } from '../board.service'
import { WordsService } from '../words.service'

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.less'],
    providers: [BoardService, WordsService],
})
export class GameComponent implements OnInit {
    @ViewChildren('wordInput') wordInputs!: QueryList<ElementRef>

    static GUESSES = 5
    @Input() size: [number, number] = [4, 4]
    isInit = false
    board: string[][] = []
    possibleWords: Set<string> = new Set()
    solution: string[] = []
    state: { char: string; state: number; color: string }[][] = []
    guesses: string[] = ['']

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
        const { grid, possibleWords, solution } = BoardService.getRandomBoard(
            this.size
        )

        this.board = grid
        this.state = this.board.map((row) =>
            row.map((cell) => ({ char: cell, state: 0, color: '' }))
        )
        this.possibleWords = new Set(possibleWords)
        this.solution = solution
        this.isInit = true
        this.changeDetector.detectChanges()
    }

    onInput(text: string) {
        console.log('TESXT', text)

        if (!this.guesses.length) this.guesses = ['']
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

    onEnter(num: number) {
        if (!this.guesses.every((guess) => this.possibleWords.has(guess)))
            return
        this.guesses.push('')
        this.changeDetector.detectChanges()

        this.focusInput(num + 1)
    }

    focusInput(i: number) {
        Array.from(this.wordInputs)[i].nativeElement.focus()
    }

    onBackspace(event: Event, i: number) {
        if (this.guesses[i] === '') {
            // If guess was blank BEFORE backspace
            console.log('BACKSPACE', event, this.guesses[i])
            if (i !== 0) {
                // Ignore if first input
                this.guesses.pop()
                this.focusInput(i - 1)
                event.preventDefault() // Avoid deleting in new input field
            }
        }
    }
}
