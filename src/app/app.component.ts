import { Component, ViewChild } from '@angular/core'
import { GameComponent } from './game/game.component'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent {
    @ViewChild(GameComponent) GameComponent!: GameComponent
    title = 'word-game'
    statsOpen = false

    newGame() {
        this.GameComponent.newBoard()
    }
}
