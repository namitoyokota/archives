interface TestObject {
    id: string;
    isSelected: boolean;
    name: string;
}

export class VMDropdownDemoComponent {
    dropdownItems: TestObject[] = [];
    selectedDropdownItemName = '';

    filteredSearchItems: TestObject[] = [];
    selectedSearchItemName = '';

    multiselectItems: TestObject[] = [];
    selectedMultiselectItemsName = '';

    selectAllValue = false;

    private searchItems: TestObject[] = [];

    constructor() {}

    attached(): void {
        this.dropdownItems = this.getTenItems();
        this.multiselectItems = this.getTenItems();
        this.searchItems = this.getTenItems();
        this.filteredSearchItems = this.searchItems;
    }

    dropdownItemSelected($event: unknown): void {
        this.dropdownItems.forEach((item) => {
            item.isSelected = item.id === $event;
            this.selectedDropdownItemName = item.isSelected ? item.name : this.selectedDropdownItemName;
        });
    }

    handleSearch($event: string): void {
        if ($event) {
            this.filteredSearchItems = this.searchItems.filter((x) => {
                return x.name.toLowerCase().includes($event.toLowerCase());
            });
        } else {
            this.filteredSearchItems = this.searchItems;
        }
    }

    multiselectItemSelected($event: unknown): void {
        const item = this.multiselectItems.find((x) => {
            return x.id === $event;
        });
        item.isSelected = !item.isSelected;
        this.selectAllValue = this.multiselectItems.every((x) => {
            return x.isSelected;
        });
        this.setMultiselectString();
    }

    searchItemSelected($event: unknown): void {
        this.filteredSearchItems.forEach((item) => {
            item.isSelected = item.id === $event;
            this.selectedSearchItemName = item.isSelected ? item.name : this.selectedSearchItemName;
        });
    }

    toggleAll(): void {
        this.selectAllValue = !this.selectAllValue;
        this.multiselectItems.map((x) => {
            return (x.isSelected = this.selectAllValue);
        });
        this.setMultiselectString();
    }

    private getTenItems(): TestObject[] {
        const tenItems: TestObject[] = [];

        for (let i = 1; i <= 10; i++) {
            tenItems.push({
                id: i.toString(),
                isSelected: false,
                name: 'Item ' + i,
            } as TestObject);
        }

        return tenItems;
    }

    private setMultiselectString(): void {
        const selectedItems = this.multiselectItems.filter((x) => {
            return x.isSelected;
        });

        if (selectedItems.length > 1) {
            this.selectedMultiselectItemsName = selectedItems.length + ' items selected';
        } else if (selectedItems.length === 1) {
            this.selectedMultiselectItemsName = selectedItems[0].name;
        } else {
            this.selectedMultiselectItemsName = '';
        }
    }
}
