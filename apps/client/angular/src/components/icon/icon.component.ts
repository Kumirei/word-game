import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
    input,
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
    cross: {
        id: 'cross',
    },
}

@Component({
    selector: 'icon',
    template: `
        <svg width="20" height="20" viewBox="0 0 20 20">
            <use
                [attr.xlink:href]="'../../assets/icons.svg#' + Icons[type()].id"
            ></use>
        </svg>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
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
    type = input.required<keyof typeof Icons>()

    Icons = Icons
}
