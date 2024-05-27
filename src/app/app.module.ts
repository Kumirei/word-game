import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { GameComponent } from '../components/game/game.component'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { Twinkles } from '../components/twinkles/twinkles.component'
import { StatsComponent } from '../components/stats/stats.component'
import { ChartComponent } from '../components/chart/chart.component'

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        Twinkles,
        ChartComponent,
        GameComponent,
        StatsComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
