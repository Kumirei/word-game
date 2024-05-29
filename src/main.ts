import { WordsService } from './services/words/words.service'
import { enableProdMode } from '@angular/core'

import { WordGameComponent } from './components/word-game/word.game.component'
import { environment } from './environments/environment'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'

if (environment.production) {
    enableProdMode()
}

bootstrapApplication(WordGameComponent, { providers: [provideHttpClient()] })

declare global {
    interface Window {
        WordsService: typeof WordsService
    }
}
