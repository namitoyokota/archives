import { bindable, customElement, inject, PLATFORM } from 'aurelia-framework';
import { BehaviorSubject } from 'rxjs';
import { BINDING_MODES } from '../../constants/binding-modes';
import { VMContextMenuService } from '../../services/vm-context-menu.service';

@customElement('vm-search')
export class VMSearchComponent {
    /** List of items to be displayed in the autocomplete menu. If no items are provided then the menu will not be displayed. */
    @bindable(BINDING_MODES.TO_VIEW) autocompleteItems: string[] = [];

    /** Whether or not the input should be disabled. Defaults to false. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** Can be used to specify the default placeholder text of the input. If no text is specified, "Search" will be displayed. */
    @bindable(BINDING_MODES.ONE_TIME) placeholderText = 'Search';

    /** Whether or not the search icon should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) showIcon = true;

    /** Tracks the value of the search input. */
    @bindable(BINDING_MODES.TWO_WAY) value = '';

    /** Event emitter for when the search event should occur. Outputs the current search string. */
    @bindable search: (value: string) => void = null;

    /** Whether or not the input should be cleared on enter press. */
    @bindable(BINDING_MODES.ONE_TIME) private clearOnEnter = false;

    /** Whether or not the component should emit its value on keypress or on the enter key. Default value is enter key. */
    @bindable(BINDING_MODES.ONE_TIME) private searchOnKeypress = false;

    /** Tracks the list of filtered items. */
    private readonly filteredItems: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    /** The width of the menu. */
    private width = 0;

    /** x value of the input. Used for the context menu. */
    private x = 0;

    /** y value of the input. Used for the context menu. */
    private y = 0;

    constructor(@inject(VMContextMenuService) private contextMenu: VMContextMenuService) {}

    /**
     * Handles each keypress to call search() when the enter key was pressed.
     * @param $event KeyboardEvent handler for the pressed key.
     */
    handleKeypress($event: unknown): void {
        const isEnterPress = $event['key'] === 'Enter';

        if (this.searchOnKeypress && !isEnterPress) {
            this.search(this.value);
        } else if (isEnterPress) {
            this.search(this.value);
            this.contextMenu.close();

            if (this.clearOnEnter) {
                this.value = '';
            }
        }

        if (this.value?.length > 1 && this.autocompleteItems.length && !isEnterPress) {
            if (!this.y) {
                const target = $event['target'] as HTMLElement;
                this.width = target.parentElement.offsetWidth - 2;
                this.x = target.parentElement.offsetLeft;
                this.y = target.parentElement.offsetHeight + target.parentElement.offsetTop + 10;
            }

            this.filteredItems.next(this.autocompleteItems.filter((x) => x.toLowerCase().includes(this.value.toLowerCase())));

            this.contextMenu.open({
                component: PLATFORM.moduleName('../vm-search/vm-search-menu/vm-search-menu.component', 'vm-library'),
                x: this.x,
                y: this.y,
                data: {
                    items$: this.filteredItems.asObservable(),
                    width: this.width,
                },
                methods: {
                    click: (item: string) => {
                        this.value = item;
                        this.search(this.value);
                        this.contextMenu.close();
                    },
                },
            });
        } else {
            this.contextMenu.close();
        }
    }
}
