import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
    ViewEncapsulation,
} from '@angular/core'
import { StatsComponent } from '../stats/stats.component'
import { IconComponent } from '../icon/icon.component'
import { HelpComponent } from '../help/help.component'

@Component({
    selector: 'seqle-header',
    template: `
        <header>
            <h1>Seqle</h1>
            <div class="newGame">
                <button (click)="newGame.emit()">New Game</button>
                <button popovertarget="statsDialog">
                    <icon [type]="'bar-chart'"></icon>
                </button>
                <button popovertarget="helpDialog">
                    <icon [type]="'question-circle'"></icon>
                </button>
            </div>
        </header>

        <dialog
            #statsModal
            id="statsDialog"
            popover
            (beforetoggle)="statsOpen = !statsOpen"
        >
            @if (statsOpen) {
                <stats></stats>
            }
        </dialog>

        <dialog #help id="helpDialog" popover>
            <help></help>
        </dialog>
    `,
    styles: `
        header {
            text-align: center;
            padding: 0.5rem;
            position: relative;
            background-color: transparent;
            box-shadow: 1px 0 0 0 #e0fffd;
            color: #fff;
            text-shadow: 0px 0px 5px #14fffa;
        }

        .newGame {
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            display: flex;
            padding: 0.5em;
        }

        .newGame button:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        .newGame button {
            border: none;
            background: transparent;
            font-size: 1.25em;
            height: 100%;
            padding: 0.5em;
            cursor: pointer;
            font-weight: bold;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 0.5em;
            height: 2em;
            margin: auto;
            color: white;
            background: rgba(0, 0, 0, 0.1);
        }

        @media screen and (max-width: 500px) {
            .newGame {
                position: relative;
            }
        }

        dialog {
            margin: 0 auto;
            top: 10vh;
            width: 50vw;
            max-height: 80vh;
            min-height: 50vh;
            background-color: lab(12 9.42 -11.61);
            color: white;
            padding: 1rem;
            border: none;
            border-radius: 0.5rem;
            box-shadow: 2em 2em 3em 0px rgba(0, 0, 0, 0.2);
            font-size: 1.25rem;
        }

        dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.2);
        }

        dialog twinkles {
            width: 100%;
            height: 100%;
        }

        #statsDialog {
            height: 80svh;
        }
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
    imports: [StatsComponent, IconComponent, HelpComponent],
})
export class HeaderComponent {
    @Output() newGame = new EventEmitter<void>()

    statsOpen = false
}
