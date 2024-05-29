import {
    ChangeDetectionStrategy,
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import { GameComponent } from '../game/game.component'
import { FormsModule } from '@angular/forms'
import { Twinkles } from 'src/components/twinkles/twinkles.component'
import { ChartComponent } from 'src/components/chart/chart.component'
import { HeaderComponent } from 'src/components/header/header.component'
import { HelpComponent } from 'src/components/help/help.component'
import { IconComponent } from 'src/components/icon/icon.component'
import { StatsComponent } from 'src/components/stats/stats.component'

@Component({
    selector: 'word-game',
    standalone: true,
    template: `
        <twinkles [density]="1 / 15000" [onTime]="2000" [offTime]="8000" />
        <seqle-header (newGame)="newGame()" />
        <app-game />
    `,
    styles: `
        :host {
            min-height: 100dvh;
            display: block;
            overflow: hidden;
        }

        twinkles {
            width: 100lvw;
            height: 100lvh;
            display: block;
            position: absolute;
            top: 0;
            left: 0;
        }
    `,
    imports: [
        FormsModule,
        Twinkles,
        ChartComponent,
        GameComponent,
        StatsComponent,
        IconComponent,
        HeaderComponent,
        HelpComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
})
export class WordGameComponent {
    @ViewChild(GameComponent) GameComponent!: GameComponent

    newGame() {
        this.GameComponent.newBoard()
    }
}
