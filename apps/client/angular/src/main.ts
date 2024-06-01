import { WordsService } from './services/words/words.service'
import {
    enableProdMode,
    provideExperimentalZonelessChangeDetection,
} from '@angular/core'

import { environment } from './environments/environment'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'
import { WordGameComponent } from './components/word-game/word.game.component'

if (environment.production) {
    enableProdMode()
}

bootstrapApplication(WordGameComponent, {
    providers: [
        provideHttpClient(),
        provideExperimentalZonelessChangeDetection(),
    ],
})

declare global {
    interface Window {
        WordsService: typeof WordsService
    }
}
