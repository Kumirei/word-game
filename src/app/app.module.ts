import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { GameComponent } from './game/game.component'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { Twinkles } from './twinkles.component'
import { StatsComponent } from './game/stats.component'

@NgModule({
    declarations: [AppComponent, GameComponent, StatsComponent],
    imports: [BrowserModule, HttpClientModule, FormsModule, Twinkles],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
