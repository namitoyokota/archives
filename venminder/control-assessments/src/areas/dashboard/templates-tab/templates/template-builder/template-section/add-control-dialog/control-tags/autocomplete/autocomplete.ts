import { bindingMode, observable } from "aurelia-binding";
import { bindable } from "aurelia-templating";
import type { AutocompleteService } from "services/interfaces/autocomplete-service";

export class Autocomplete {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value;
    @bindable placeholder = "";
    @bindable service: AutocompleteService;

    @observable inputValue = "";
    expanded = false;
    suggestions = [];
    index = -1;
    suggestionsUL = null;
    private updatingInput = false;


    keydown(key: number): boolean {
        if (!this.expanded) {
            return true;
        }

        // down
        if (key === 40) {
            if (this.index < this.suggestions.length - 1) {
                this.index++;
                this.display(this.getName(this.suggestions[this.index]));
            } else {
                this.index = -1;
            }
            this.scroll();
            return;
        }

        // up
        if (key === 38) {
            if (this.index === -1) {
                this.index = this.suggestions.length - 1;
                this.display(this.getName(this.suggestions[this.index]));
            } else if (this.index > 0) {
                this.index--;
                this.display(this.getName(this.suggestions[this.index]));
            } else {
                this.index = -1;
            }
            this.scroll();
            return;
        }

        // escape
        if (key === 27) {
            this.collapse();
            return;
        }

        // enter
        if (key === 13) {
            if (this.index >= 0) {
                this.select(this.suggestions[this.index]);
            }
            return;
        }

        return true;
    }

    suggestionClicked(suggestion: string): void {
        this.select(suggestion, true);
    }

    valueChanged() {
        this.select(this.value);
    }

    inputValueChanged(value) {
        if (this.updatingInput) {
            return;
        }
        if (value === "") {
            this.value = null;
            this.collapse();
            return;
        }
        this.service.suggest(value).then((suggestions) => {
            this.index = -1;
            this.suggestions.splice(0, this.suggestions.length, ...suggestions);
            if (suggestions.length === 0) {
                this.select(this.inputValue);
            } else {
                this.select(this.inputValue, false);
                this.expanded = true;
            }
        });
    }

    private display(name) {
        this.updatingInput = true;
        this.inputValue = name;
        this.updatingInput = false;
    }

    private getName(suggestion: string): string {
        return suggestion ?? "";
    }

    private collapse(): void {
        this.expanded = false;
        this.index = -1;
    }

    private select(suggestion: string, collapse?: boolean): void {
        this.value = suggestion;
        this.inputValue = this.getName(this.value);
        if (collapse) {
            this.collapse();
        }
    }

    private scroll(): void {
        const ul = this.suggestionsUL;
        const li = ul.children.item(this.index === -1 ? 0 : this.index);
        if (li.offsetTop + li.offsetHeight > ul.offsetHeight) {
            ul.scrollTop += li.offsetHeight;
        } else if (li.offsetTop < ul.scrollTop) {
            ul.scrollTop = li.offsetTop;
        }
    }
}
