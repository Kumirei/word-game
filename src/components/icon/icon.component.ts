import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
} from '@angular/core'

const Icons = {
    'bar-chart': {
        id: 'bar-chart',
    },
    'question-circle': {
        id: 'question-circle',
    },
    backspace: {
        id: 'backspace',
    },
    enter: {
        id: 'enter',
    },
}

@Component({
    selector: 'icon',
    template: `
        <svg width="20" height="20" viewBox="0 0 20 20">
            <use
                [attr.xlink:href]="'../../assets/icons.svg?#' + Icons[type].id"
            ></use>
        </svg>
    `,
    styles: `
        :host {
            display: block;
        }

        svg {
            fill: currentColor;
            height: 1em;
            width: 1em;
        }
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated,
})
export class IconComponent {
    @Input({ required: true }) type!: keyof typeof Icons

    Icons = Icons
}
