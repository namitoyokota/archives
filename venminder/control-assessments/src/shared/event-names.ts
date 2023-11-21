export namespace EventNames {
  export namespace Api {
    export const API_ERROR_DIALOG_OPEN = "Api:Error:Dialog:Open";
    export const API_ERROR_DIALOG_CLOSED = "Api:Error:Dialog:Closed";
  }

  export namespace Assessments {
    export const SECTION_RATING_INVALID = "Assessments:Sections:Rating:Invalid";
    export const CONTROL_INVALID = "Assessments:Sections:Control:Invalid";
    export const OVERALL_RATING_INVALID = "Assessments:Rating:Invalid";

    // TODO: uncomment below after rating type added
    // export const OVERALL_RATING_TYPE_INVALID = 'Assessments:RatingType:Invalid';
  }

  export namespace Templates {
    export const SECTION_MODIFIED = "Templates:Section:Modified";
    export const SECTIONS_SUBHEADER = "Templates:Sections:Subheader";
    export const SECTIONS_CONTROL = "Templates:Sections:Control";
    export const DELETE_SECTION = "Templates:DeleteSection";
    export const SECTION_INVALID = "Template:Sections:Invalid";
    export const SUBHEADER_INVALID = "Template:Sections:Subheader:Invalid";
    export const CONTROL_INVALID = "Templates:Sections:Control:Invalid";
  }

  export namespace Controls {
    export const REFRESH_LIST = "Controls:RefreshList";
    export const ANSWER_LIST_CHANGED = "Controls:AnswerList:Changed";
    export const CARET_BUTTON_CLICKED = "Controls:CaretButtonClicked";
    export const TAG_SELECTED = "Controls:TagSelected";
  }
}
