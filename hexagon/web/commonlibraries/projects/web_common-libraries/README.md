# Common Libraries

This package contains common elements that are used throughout the UI.  

## Components

Common UI elements such as dropdowns, and buttons are provided by a combination of this package and [Angular Material (Mat)](https://material.angular.io/components/categories). Some components are wrappers for Mat components so that styling can easily be applied.

### Component List

This package provides the following components

* Confirm Dialog
* Dropdown
* Expansion Panel
* Tab
* Chip
* Infinite Scroll Pane
* Media Grid

Other Mat components have been styled to match the style guide. Some of the components include.

* Radio Button
* Checkbox
* Datepicker
* Slider
* Slide Toggle
* Progress Bar
* Progress Spinner
* Dialog

__Most components should already have support for a disabled state. Just add [disabled]="true" to the component.__

### Setup

1. Install the common libraries package
    1.1. `yarn add @galileo/common-libraries`
2. Import the common theme scss file to the root angular.json file.
    
_Note: If you created a project using the layout-manager-schematics then all of this should already be setup for you._

---

### Theme
A defult theme file is provided. This sets the theme for most elements like tags like header, inputs, ect. Try to use the base theme whenever possiable.

#### Input
The style for a simple input box has been set up. There is also a wrapper for the input box (see below) that adds the ability to set validation states and add icons to the input box.

#### Hyperlinks
The default style for hyperlink is that of an exteranl link or internal file (blue). Linking within the sytem (internal) should have a style that matches the surrounding text. Add the class "in-system" to this type of links.

#### Button
There are three button classes you can use depending on the button type you want to display. The options are "hxgn-btn-primary", "hxgn-btn-secondary", and "hxgn-btn-selected". Both the primary and secondary buttons have support for hover and disabled states. Currently the selected button only has one state per the current UX design.

##### Preferred Action
This button is blue. Set the color to primary.

##### Example

_HTML Example__
```html
<button class="hxgn-btn-primary">Button</button>
<button class="hxgn-btn-primary" [disabled]="true">Button</button>
```

##### Secondary Action
This button is light gray.

_HTML Example__
```html
<button class="hxgn-btn-secondary">Button</button>
<button class="hxgn-btn-secondary" [disabled]="true">Button</button>
```

##### Buttons for Selection/Toggles (States)
This button looks just the the secondary action but can also show selection. Add the class mat-button-selected to the button when you want to show it as being selected.

_HTML Example_
```html
<button class="hxgn-btn-selected">Button</button>
```

#### Confirm Dialog

`CommonConfirmDialogComponent` is based on [MatDialog](https://material.angular.io/components/dialog/overview). This dialog is intended to be used when a simple message with either "ok" or "cancel" as response is needed.

##### Classes

###### ConfirmDialogData

This interface is used to pass data into the dialog.

| Name      | Description                      |
| --------- | -------------------------------- |
| `title: string` | String that will be shown in the header of the dialog. Must be a translated string and not a token.|
|`msg: string` | The string that will be displayed in the body of the dialog. Must be a translated string and not a token. |

##### Events

_*Since this component is based on MatDialog all the event that are proved by MatDialog are supported._

| Name | Description |
| ---- | ----------- |
| `afterClosed(): Observable<boolean>` | Gets an observable that is notified when the dialog is finished closing. The value of the observable will be true for 'ok' responses. |

---

#### CommonExpansionPane

`<hxgn-common-expansion-panel>` provides an expandable panel.

##### API reference for Common Expansion Panel

`import { CommonExpansionPanelModule } from @galileo/common-libraries;`

#### Directives

_CommonExpansionPanelComponent_

Directive for a Common Expansion Pane.

Selector: `hxgn-common-expansion-panel`
Exported as: `CommonExpansionPanelComponent`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `@Input() panelState: PanelState` | The inital state of the expansion panel,  expanded or collapsed. The default is PanelState.Collapsed |
|`@Output() stateChange: EventEmitter<PanelState>`| An event emitted when the panel is expanded or collapsed.|

##### Methods

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| toggle(): void  | Toggles the state of the panel.                                |

_CommonExpansionPanelHeaderComponent_

This directive is to be used inside the CommonExpansionPanelComponent. Any HTML placed inside this component will be displayed in the header of the common expansion pane.

Selector: `hxgn-common-expansion-panel-header`

_CommonExpansionPanelTitleComponent_

This directive is to be used inside the CommonExpansionPanelComponent. Any HTML placed inside this component will be displayed in the header after any header components of the common expansion pane.

Selector: `hxgn-common-expansion-panel-title`

_CommonExpansionPanelContentComponent_

This directive is to be used inside the CommonExpansionPanelComponent. Any HTML placed inside this component will be displayed in the body of the expansion panel. This content will be hidden when the panel is collapsed.

Selector: `hxgn-common-expansion-panel-content`

##### Enums

_PanelState_

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| Expanded        | The panel should be shown.                                     |
| Collapsed       | The panel show be hidden.                                      |

##### Example

_HTML_
```html
 <hxgn-common-expansion-panel panelState="expanded"
    (toggle)="onToggle()">
     <hxgn-common-expansion-panel-title>
         Common Panel For Widgets
     <hxgn-common-expansion-panel-title>
    <hxgn-common-expansion-panel-content>
        <p>I am a description about a widget</p>
        <img src="" />
        <span>*Note: this is a good widget</span>
    </hxgn-common-expansion-panel-content>
 <\hxgn-common-expansion-panel>
````

---

#### CommonTab

`<hxgn-common-tabs>` provides a component that allows switching between tabs.

This component is a wrapper component for Angular Material's Tab component. For full api of tab component see [Material's documentation](https://material.angular.io/components/tabs/overview).

##### API reference for Common Tab

`import { CommonTabsModule } from @galileo/common-libraries;`

#### Directives

_CommonTabComponent_

Directive for a Common Tab.

Selector: `hxgn-common-tabs`
Exported as: `CommonTabComponent`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
|@Input() theme: string |  Options: light, dark.  There are two themes for the tab component. The default is light. |

##### Example

_HTML_
```html
    <hxgn-common-tabs theme="dark">
        <mat-tab-group>
            <mat-tab label="First"> Content 1 </mat-tab>
            <mat-tab label="Second"> Content 2 </mat-tab>
            <mat-tab label="Third"> Content 3 </mat-tab>
        </mat-tab-group>
    </hxgn-common-tabs>
```

---

#### CommonDropdownComponent / CommonDropdownComponent$v2

`<hxgn-common-dropdown>` provides a dropdown selection box.
`<hxgn-common-dropdown-v2>` provides a dropdown selection box but is updated to match the UX style guide.

The intent of this component is to be used as a selection box. If a custom drop down menu is needed use [Material's Menu](https://material.angular.io/components/menu/overview) component.

##### API reference for Common Dropdown

`import { CommonDropdownModule } from @galileo/common-libraries;`
`import { CommonDropdownModule$v2 } from @galileo/common-libraries;`

#### Directives

_CommonDropdownComponent_

Directive for a Common Dropdown selection box.

Selector: `hxgn-common-dropdown`
Exported as: `CommonDropdownComponent`

__DEPRECATED__ 

_CommonDropdownComponent$v2_

Directive for a Common Dropdown selection box.

Selector: `hxgn-common-dropdown-v2`
Exported as: `CommonDropdownComponent$v2`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| @Input() value: any | The selected value of the dropdown |
| @Input() items: string | __DEPRECATED__ |
| @Input() dropdownItems: DropdownItem[] | __DEPRECATED__ |
| @Input() placeholder:string | The text to be displayed when no item is selected. |
| @Inpur() name: string | __DEPRECATED__ |
| @Input() dropdownTitle: string | __DEPRECATED__ |
| @Input() toggledOn: boolean = false | __DEPRECATED__ |
| @Input() multiple: boolean = false | __DEPRECATED__ |
| @Input() checkboxes: boolean = false | __DEPRECATED__ |
| @Input() required: boolean = false | Is this a required field. |
| @Input() disabled: boolean = false | Controls if the component is disabled. |
| @Input() horizontalList: boolean = false | __DEPRECATED__ |
| @Input() buttonOnly: boolean = false | __DEPRECATED__ _*Use Material's Menu_ |
| @Input() compareWith: Function | Function to compare the option values with the selected values. The first argument is a value from an option. The second is a value from the selection. A boolean should be returned.|
| @Output() selectionChange: EventEmitter<MatSelectChange> | Fired when the selected item changes.|
| @Output() valueChange: EventEmitter<any> | Fired when the selected value changes. |
| @Output() openedChange:  EventEmitter<boolean> | Fired when the dropdown is shown or hidden. Returns true if the dropdown is shown.
| @Output() toggledOnChange: EventEmitter<any> | __DEPRECATED__ |

##### Methods

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| close(): void | Hides the dropdown box. |
| open(): void | Shows the dropdown box. |
| focus(): void | Sets the focus on the dropdown box. |

_*Any other methods not documented above should be treated as being deprecated!_

_CommonDropdownTrigger_

Allows the user to customize the trigger that is displayed when the select has a value.

Selector: `hxgn-common-dropdown-trigger`
Exported as: `CommonDropdownTriggerComponent`

__DEPRECATED__ 

_CommonDropdownTrigger$v2_

Allows the user to customize the trigger that is displayed when the select has a value.

Selector: `hxgn-common-dropdown-trigger-v2`
Exported as: `CommonDropdownTriggerComponent$v2`

_*See Angular Material's Documentation for more information._

_CommonDropdownToggleButton_

Selector: `hxgn-common-dropdown-toggle-button`
Exported as: `CommonDropdownToggleButton`

__DEPRECATED__ 

_CommonDropdownItemComponent_

The item that will be shown in the drop down.

Selector: `hxgn-common-dropdown-item`
Exported as: `CommonDropdownItemComponent`

__DEPRECATED__ 

_CommonDropdownItemComponent$v2_

The item that will be shown in the drop down.

Selector: `hxgn-common-dropdown-item-v2`
Exported as: `CommonDropdownItemComponent$v2`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| @Input() value: any | The value of the item. |
| @Input() width: string | __DEPRECATED__ |
| @Input() height: string | __DEPRECATED__ |
| @Output() click: EventEmitter<any> | Is fired when the item is clicked. |

##### Example

_HTML_
```html
 <hxgn-common-dropdown [value]="id"
                    (selectionChange)="selectionChange($event)"
                    (openedChange)="checkIfCanOpen($event)">
  	<hxgn-common-dropdown-trigger>
  		<img *ngIf="isDefault()" src="assets/star_for_button.png">
  		{{getSelected().name}}
  	</hxgn-common-dropdown-trigger>
	<hxgn-common-dropdown-item *ngFor="let item of getItems()" [value]="id">
		<img *ngIf="isDefault(id)" src="assets/star_for_button.png">
		{{item.name}}
	</hxgn-common-dropdown-item>
</hxgn-common-dropdown>
````
__DEPRECATED__ 

---
_V2 HTML_
```html
 <hxgn-common-dropdown-v2 [value]="id"
                    (selectionChange)="selectionChange($event)"
                    (openedChange)="checkIfCanOpen($event)">
  	<hxgn-common-dropdown-trigger-v2>
  		<img *ngIf="isDefault()" src="assets/star_for_button.png">
  		{{getSelected().name}}
  	</hxgn-common-dropdown-trigger-v2>
	<hxgn-common-dropdown-item-v2 *ngFor="let item of getItems()" [value]="id">
		<img *ngIf="isDefault(id)" src="assets/star_for_button.png">
		{{item.name}}
	</hxgn-common-dropdown-item-v2>
</hxgn-common-dropdown-v2>
````
---

#### CommonChipComponent

`<hxgn-common-chip>` displays an item in a tag like box.

##### API reference for Common Dropdown

`import { CommonChipModule } from @galileo/common-libraries;`

#### Directives

_CommonChipComponent_

Directive for a Common Chip.

Selector: `hxgn-common-chip`
Exported as: `CommonChipComponent`

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| @Input() endCapEnabled: boolean | Determines if the end cap should be shown. The end cap is a color bar on the left side of the component. [default = true]   |
| @Input() removable: boolean | When enabled shows a remove button. [default = false] |
| @Input() endCapColor: string | The color of the end cap. |
| @Input() backgroundColor: string | The background color of the component. |
| @Input() color: string | The text color. |
| @Output() removed: EventEmitter\<void> | Is fired when the remove button is clicked. |

##### Enums

_ChipColor_

Commonly used colors.

| Name            | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| Gray            | #DFE0E1                                                        |
| Low             | #8CC63F                                                        |
| Medium          | #FCEE21                                                        |
| High            | #C1272D                                                        |
| Selected        | #5AB5FF                                                        |

_HTML_
```html
<hxgn-common-chip (removed)="echo('removed')" 
                    [removable]="true"
                    [endCapColor]="ChipColor.Medium"
                    [backgroundColor]="ChipColor.Gray">
    Date range: 4/4/2016 - 4/5/2016
</hxgn-common-chip>
```

#### CommonInfiniteScrollPaneComponent

`<hxgn-common-infinite-scroll-pane>` Allows for lazying loading a list of items.

##### API reference for Common Infinite Scroll Pane Component

`import { CommonInfiniteScrollPaneModule } from @galileo/common-libraries;`

#### Directives

Directive for Common Infinite Scroll Pane.

Selector: `hxgn-common-infinite-scroll-pane`
Exported as: `CommonInfiniteScrollPaneComponent`

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| @Input() itemMinHeight: number| The min height an item in the list can be. The values is passed as a number, but is measured in px. The min height should be greater then zero and is required. |
| @Input('itemCount'): number | How many items are currently loaded into the scroll pane. Required. |
| @Input() disableLoad: boolean | When true the scroll load even will be disabled. This should be set to true when all the paged data has been laded. |
|  @Input() bufferSize: number | How many pages of data should be loaded. Default is 2.|
| @Input() scrollUp: boolean | When true the loadPage event will trigger only when scrolling to the top of the scroll area, and the scroll bar will start at the bottom. |
| @Output() loadPage:  EventEmitter\<number> | Event that is emitted when a new page of data should be loaded. The size of the requested paged is returned with the event. |

##### Example

_HTML_
```html
    <hxgn-common-infinite-scroll-pane [itemMinHeight]="100" [itemCount]="items?.length" (loadPage)="loadItems($event)">
    <item-component  *ngFor="let item of items;trackBy: trackByFn"
        [indexEntry]="item"></hxgn-commonconversations-list-item>
    </item-component>
```

#### CommonListSteps

`<hxgn-common-list-steps>` Provides a vertical list of bulleted steps. Each steps name and state is provided by 
an input array. These steps can be marked as optional and completed, and can be controlled by the input data. 

##### API reference for Common Expansion Panel

`import { CommonListStepsModule } from @galileo/common-libraries;`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `@Input() listSteps: ListStep` | An input array of list step objects. Contains the translation tokens that serve
as the names for each step, as well as two booleans that represent if the step is optional or has been completed. |
| `@Input() selectedIndex: number` | The index of the currently selected step. Can be changed to manipulate the stepping order. |
|`@Output() indexChanged: EventEmitter<number>`| If the user clicks on a step, this event emitter emits the selected
 steps index so that the input selectedIndex can be updated (The selectedIndex is changed internally but will not affect the parent components value).|

##### Objects

_ListStep

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| token           | A translation token for the step name.                         |
| optional        | represents if the step is to marked as optional.               |
| complete        | Represents if the step is marked as completed.                 |

##### Example

_HTML_
```html
     <hxgn-common-list-steps [listSteps]="listItems" [selectedIndex]="index" (indexChanged)="index = $event">
     </hxgn-common-list-steps>
```

---

#### CommonColorPickerButtonComponent

`<hxgn-common-color-picker-button>` A button when click shows a color picker. 

##### API reference for Common Color Picker Button component

`import { CommonColorPickerModule } from @galileo/common-libraries;`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `@Input() defaultColor: string` | Hex color that the color picker will be set to. Default is #d81a1c. |
| `@Input() presetColors: string[]` | Optional list of preset colors that the use can pick from. |
| `@Output() selectedColor: EventEmitter<string>`| Event that is fired when the selected color changes.|

##### Example

_HTML_
```html
     <hxgn-common-color-picker-button deafultColor="#cccccc" [presetColors]="['#000000', '#cccccc']"></hxgn-common-color-picker-button>

 ````

#### MediaGrid

`<hxgn-common-media-grid>` A component for displaying media in a grid.

##### API reference for media grid component

`import { CommonMediaModule } from @galileo/common-libraries;`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
|@Input() fetcher: MediaURLFetcher| Used to get the url for the media.|
|@Input() mediaList: Media$v1[]| List of media items to display in the grid.|

##### Example

_HTML_
```html
     <hxgn-common-media-grid [mediaList]="mediaList" [fetcher]="urlFetcher"></hxgn-common-media-grid>
 ````

#### CommonPopover

`<hxgn-common-popover>` provides a component that mimics the behavior of mat-menu with an arrow pointing towards the center of the trigger element by default.

##### API reference for CommonPopover

`import { CommonPopoverModule } from @galileo/common-libraries;`

#### Directives

_CommonPopoverComponent_


Selector: `hxgn-common-popover`
Exported as: `CommonPopoverComponent`

##### Properties

| Name            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
|@Input() backdrop: string | Color code for backdrop. Optional. |
|@Input() disableClose: boolean | Prevents user from closing the popover on backdrop click. Optional. |
|@Input() height: string | User specified height of popover. Optional. |
|@Input() isShown: boolean | Whether or not the popover should be open by default. Optional. |
|@Input() menuMode: boolean | Displays popover in menu mode (no arrow). Optional. |
|@Input() origin: CdkOverlayOrigin | The origin point (trigger) for the popover. __REQUIRED.__ |
|@Input() position: PopoverPosition | User defined position for the popover. Optional. |
|@Input() showDismiss: boolean | Shows the dismiss button. Optional. |
|@Input() userPersonalization: string | User personalization string. Shows the "Don't show again" checkbox when specified. Optional. |
|@Input() width: string | User specified width of string. Optional. |

##### Enums

_PopoverPosition_

Possible user specified positions the popover can be rendered in.

| Name            | Value       |
| --------------- | ------------|
| aboveLeft       | above-left  |
| aboveRight      | above-right |
| belowLeft       | below-left  |
| belowRight      | below-right |
| leftAbove       | left-above  |
| leftBelow       | left-below  |
| rightAbove      | right-above |
| rightBelow      | right-below |

##### Example

_HTML_
```html
<button class="hxgn-btn-secondary" (click)="popover.open()" cdkOverlayOrigin #origin="cdkOverlayOrigin">
    Open Popover
</button>
<hxgn-common-popover #popover [origin]="origin" position="above-left">
    <div>
        Popover Content Goes Here
    </div>
</hxgn-common-popover>
```
---