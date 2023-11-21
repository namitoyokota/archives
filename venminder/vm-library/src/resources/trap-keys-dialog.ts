import { customAttribute, inject } from 'aurelia-framework';

@customAttribute('tabnav')
export class TrapKeysDialog {
    element: Element;
    tabNavigate: (e: KeyboardEvent) => void;

    constructor(@inject(Element) element) {
        this.element = element;

        this.tabNavigate = (e): void => {
            const target = e.target as HTMLButtonElement;
            const templateName = target.getAttribute('data-id');
            const vmEle = document.querySelector(templateName);
            const eles = vmEle.querySelectorAll('a, input, textarea, [tabindex="0"], button:not([disabled]');
            const firstEle = eles[0] as HTMLElement;
            const lastEle = eles[eles.length - 1] as HTMLElement;

            if (e.type === 'keydown' && e.key.toLowerCase() === 'tab') {
                if (target.classList.contains('top')) {
                    lastEle.focus();
                } else if (target.classList.contains('bottom')) {
                    firstEle.focus();
                }
            }
        };
    }

    attached(): void {
        this.element.addEventListener('keydown', this.tabNavigate);
    }

    detached(): void {
        this.element.removeEventListener('keydown', this.tabNavigate);
    }
}
