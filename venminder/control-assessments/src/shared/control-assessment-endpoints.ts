/* eslint-disable @typescript-eslint/no-namespace */
import { ControlAssessmentsEndpoint } from "./control-assessments-endpoint";
export namespace ControlAssessmentsEndpoints {
  export namespace Api {
    export namespace Controls {
      export const SAVE_CONTROL = new ControlAssessmentsEndpoint(
        "saveControl",
        "/Controls/SaveControl"
      );

      export const DELETE_CONTROL = new ControlAssessmentsEndpoint(
        "deleteControl",
        "/Controls/DeleteControl"
      );

      export const GET_CONTROL_LIST = new ControlAssessmentsEndpoint(
        "getControlList",
        "/Controls/GetControlList"
      );

      export const GET_TAG_LIST = new ControlAssessmentsEndpoint(
        "getTagList",
        "/Controls/GetTags"
      );
    }

    export namespace Templates {
      export const SAVE_TEMPLATE = new ControlAssessmentsEndpoint(
        "saveTemplate",
        "/Templates/SaveTemplate"
      );

      export const DUPE_TEMPLATE = new ControlAssessmentsEndpoint(
        "dupeTemplate",
        "/Templates/DupeTemplate"
      );

      export const DELETE_TEMPLATE = new ControlAssessmentsEndpoint(
        "deleteTemplate",
        "/Templates/DeleteTemplate"
      );

      export const GET_TEMPLATE_LIST = new ControlAssessmentsEndpoint(
        "getTemplateList",
        "/Templates/GetTemplateList"
      );

      export const GET_TEMPLATE = new ControlAssessmentsEndpoint(
        "getTemplate",
        "/Templates/GetTemplate"
      );

      export const GET_PLACEHOLDER_LIST = new ControlAssessmentsEndpoint(
        "getPlaceholderList",
        "/Templates/GetPlaceholderList"
      );

      export const GET_TYPE_LIST = new ControlAssessmentsEndpoint(
        "getAssessmentTypeList",
        "/Assessments/GetAssessmentTypesWithIDs"
      );
    }

    export namespace Themes {
      export const GET_THEME_LIST = new ControlAssessmentsEndpoint(
        "getThemeList",
        "/Themes/GetThemeList"
      );

      export const SAVE_THEME = new ControlAssessmentsEndpoint(
        "saveTheme",
        "/Themes/SaveTheme"
      );

      export const DELETE_THEME = new ControlAssessmentsEndpoint(
        "deleteTheme",
        "/Themes/DeleteTheme"
      );
    }

    export namespace DataLibrary {
      export const SAVE_DATA_LIBRARY = new ControlAssessmentsEndpoint(
        "saveDataLibrary",
        "/DataLibrary/SaveDataLibrary"
      );
    }

    export namespace Orders {
      export const GET_ORDER_DETAILS = new ControlAssessmentsEndpoint(
        "getOrderDetails",
        "/Order/GetOrderDetails"
      );
    }

    export namespace Assessments {
      export const SAVE_ASSESSMENT = new ControlAssessmentsEndpoint(
        "saveAssessment",
        "/Assessments/SaveAssessment"
      );

      export const GET_ASSESSMENT_DATA = new ControlAssessmentsEndpoint(
        "getAssessmentData",
        "/Assessments/GetAssessmentData"
      );

      export const CREATE_NEW_ASSESSMENT = new ControlAssessmentsEndpoint(
        "createNewAssessment",
        "/Assessments/CreateNewAssessment"
      );

      export const DOES_ASSESSMENT_EXIST = new ControlAssessmentsEndpoint(
        "doesAssessmentExist",
        "/Assessments/DoesAssessmentExist"
      );

      export const GET_MERGED_ASSESSMENT = new ControlAssessmentsEndpoint(
        "mergeData",
        "/MergeData/MergeData"
      );
    }

    export namespace Ratings {
      export const GET_RATING = new ControlAssessmentsEndpoint(
        "getRating",
        "/Ratings/GetRating"
      );
    }
  }
}
