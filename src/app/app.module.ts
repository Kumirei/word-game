import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { GameComponent } from '../components/game/game.component'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { Twinkles } from '../components/twinkles/twinkles.component'
import { StatsComponent } from '../components/stats/stats.component'
import { ChartComponent } from '../components/chart/chart.component'
import { IconComponent } from '../components/icon/icon.component'

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    providers: [provideHttpClient(withInterceptorsFromDi())],
    imports: [
        BrowserModule,
        FormsModule,
        Twinkles,
        ChartComponent,
        GameComponent,
        StatsComponent,
        IconComponent,
    ],
})
export class AppModule {}
