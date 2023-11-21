import { ControlType } from "../../services/interfaces/control-type";

export const DropdownDisplayTypes: ControlType[] = [
    { id: 1, displayType: "CHECKBOX", name: "Checkboxes", type: "/checkbox/checkbox-control", isSelected: false },
    { id: 2, displayType: "RADIO_YES_NO", name: "Radio Buttons - yes,no", type: "/radio-button/radio-button-control", isSelected: false },
    { id: 3, displayType: "RADIO_MENTIONED", name: "Radio Buttons - mentioned,tested", type: "/radio-button/radio-button-control", isSelected: false },
    { id: 4, displayType: "DATE", name: "Date", type: "/datepicker/datepicker-control", isSelected: false },
    { id: 5, displayType: "DROPDOWN", name: "Dropdown", type: "/dropdown/dropdown-control", isSelected: false },
    { id: 6, displayType: "TEXTFIELD", name: "Text Field", type: "/textbox/textbox-control", isSelected: false },
];