import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core'

@Component({
    selector: 'help',
    template: `
        <h2>How to play</h2>
        <p><em class="bold">Goal:</em> Fill the board by placing down word</p>
        <p>
            <em class="slant bold">Hint:</em> Sometimes a short word is better
            than a long one
        </p>
        <br />
        <h3>Rules:</h3>
        <ul>
            <li>The official solution is always four 4 letter words</li>
            <li>
                Try to beat the official solution by solving it in 3 or less
            </li>
            <li>Guesses may be of any length</li>
            <li>Win by using each letter at least once</li>
        </ul>
        <div class="example">
            <div class="board">
                <div class="cell">S</div>
                <div class="cell">K</div>
                <div class="cell mark">E</div>
                <div class="cell">T</div>
                <div class="cell">A</div>
                <div class="cell mark">Q</div>
                <div class="cell mark">L</div>
                <div class="cell mark">E</div>
                <div class="cell">B</div>
                <div class="cell mark">E</div>
                <div class="cell">U</div>
                <div class="cell">I</div>
                <div class="cell mark">S</div>
                <div class="cell">N</div>
                <div class="cell">D</div>
                <div class="cell">Z</div>
            </div>
        </div>
    `,
    styles: `
        dialog h2 {
            font-size: 2rem;
            text-align: center;
        }

        .bold {
            font-weight: bold;
            font-style: normal;
        }

        .slant {
            font-style: italic;
        }

        .example {
            display: grid;
            justify-content: center;
            padding-top: 2em;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(4, 2em);
            grid-template-rows: repeat(4, 2em);
            background: linear-gradient(144deg, #9416afeb 0%, #2db6e2ad 100%);
        }

        .board .cell {
            color: black;
            text-align: center;
            line-height: 2em;
        }

        .board .cell.mark {
            background-color: rgb(226, 112, 255);
        }

        svg {
            fill: white;
        }
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
})
export class HelpComponent {}
