import { Section } from "areas/dashboard/models/section";
import { SectionControlModel } from "areas/dashboard/models/section-control-model";
import { DialogService } from "aurelia-dialog";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { computedFrom, inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { AssessmentTypeWithIDs } from "services/models/assessments/assessment-type";
import { SaveTemplateRequest } from "services/models/templates/save-template-request";
import { SectionControl } from "services/models/templates/section-control";
import { SubHeader } from "services/models/templates/sub-header";
import { Template } from "services/models/templates/template";
import { TemplateSection } from "services/models/templates/template-section";
import { TemplateTheme } from "services/models/themes/theme";
import { TemplateService } from "services/template-service";
import { ThemeService } from "services/theme-service";
import { MessageDialog } from "shared/dialogs/message-dialog";
import { MessageDialogModel } from "shared/dialogs/message-dialog-models";
import { TemplateStatus } from "shared/enums/template-statuses";
import { EventNames } from "shared/event-names";
import { AnswerOption } from "shared/models/answer-option";
import { DynamicControl } from "shared/models/dynamic-control";
import { SectionSubHeaderModel } from "shared/models/section-sub-header-model";

export class TemplateBuilder {
  templateTitle = "";
  template: Template = null;
  listOfSections: DynamicControl[] = [];
  hasFocus = true;

  typeDropdownItems: AssessmentTypeWithIDs[] = [];
  levelDropdownItems: string[] = [];
  themeDropdownItems: TemplateTheme[] = [];

  selectedTypeItem: AssessmentTypeWithIDs = null;
  selectedLevelItem = "";
  selectedThemeItem: TemplateTheme = null;

  typeErrors: string[] = [];
  levelErrors: string[] = [];
  themeErrors: string[] = [];

  private focusToTitle = true; // Default so that first pass is set correctly
  private errorIsOpen = false; // Prevents multiple saveTemplate submissions while error pop-up is open, which results in infinite loop
  private sectionID = 0;
  private previousTitle: string;

  private eventSections: Subscription = null;
  private eventSectionsDelete: Subscription = null;
  private eventApiErrorDialogOpen: Subscription = null;
  private eventApiErrorDialogClosed: Subscription = null;

  @computedFrom("templateTitle")
  get canSave(): boolean {
    return this.templateTitle.trim().length !== 0;
  }

  // TODO: Update to correct field for Preview button
  @computedFrom("templateTitle")
  get canPreview() {
    return false;
  }

  @computedFrom("templateTitle", "listOfSections.length")
  get canPublish() {
    return (
      this.templateTitle.trim().length !== 0 && this.listOfSections.length > 0
    );
  }

  @computedFrom("previousTitle")
  get canAddSection() {
    return this.previousTitle.trim().length > 0;
  }

  constructor(
    @inject(Router) private readonly router: Router,
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(TemplateService) private readonly templateService: TemplateService,
    @inject(ThemeService) private readonly themeService: ThemeService,
    @inject(DialogService) public readonly dialogService: DialogService
  ) {}

  async activate(data): Promise<void> {
    await this.loadDropdowns();

    this.templateTitle = data.templateTitle
      ? decodeURIComponent(data.templateTitle)
      : "";
    this.previousTitle = this.templateTitle;

    if (this.templateTitle) {
      await this.loadTemplate();
      this.setDefaultDropdowns();
    }

    this.setDefaultTheme();
  }

  attached(): void {
    this.attachSubscriptions();
  }

  detached(): void {
    this.detachSubscriptions();
  }

  /** Adds new section to template */
  addSection(): void {
    this.sectionID += 1;
    this.listOfSections.push(
      new DynamicControl(
        "template-section",
        this.sectionID,
        new Section(this.sectionID, null, true, [])
      )
    );
  }

  /** Save template then route back to template list page */
  async saveAndClose(): Promise<void> {
    const success = await this.saveTemplate();
    if (success) {
      this.router.navigate("/templates/templates-tab/template-list");
    }
  }

  /** Saves current template as published */
  async publishTemplate(): Promise<void> {
    const validated = await this.validateTemplate();

    if (validated) {
      const success = await this.saveTemplate(true);

      if (success) {
        // Display success dialog
        this.dialogService
          .open({
            viewModel: MessageDialog,
            model: new MessageDialogModel(
              "Published",
              "Your assessment is now ready to use."
            ),
          })
          .whenClosed(() => {
            this.router.navigate("/templates/templates-tab/template-list");
          });
      }
    } else {
      // Display error dialog
      this.dialogService.open({
        viewModel: MessageDialog,
        model: new MessageDialogModel(
          "Unable to Complete",
          "Please complete all required fields and try again."
        ),
      });
    }
  }

  /** Save title and start editing template */
  async autoSaveTitle(): Promise<void> {
    const templateTitle = this.templateTitle.trim();
    if (
      this.previousTitle !== templateTitle &&
      this.template?.status !== TemplateStatus.Published
    ) {
      const success = await this.saveTemplate();

      if (success) {
        this.router.navigate(
          `/templates/template-builder/template-edit/${encodeURIComponent(
            templateTitle
          )}`
        );
      }
    }
  }

  /** Saves template changes */
  async saveTemplate(publish = false): Promise<boolean> {
    if (this.canSave && !this.errorIsOpen) {
      return await this.templateService
        .saveTemplate(this.buildTemplate(publish))
        .then(() => {
          // Only set if successful save
          this.previousTitle = this.templateTitle;
          return true;
        })
        .catch((e) => {
          if (e == `Error: "A template already exists with that name."`) {
            this.focusToTitle = true;
          }
          return false;
        });
    } else {
      return false;
    }
  }

  private attachSubscriptions(): void {
    if (this.eventSections == null) {
      this.eventSections = this.ea.subscribe(
        EventNames.Templates.SECTION_MODIFIED,
        (model: Section) => {
          const section = this.listOfSections.find(
            (section) => section.model.id === model.id
          );
          section.model = model;
          this.saveTemplate();
        }
      );
    }

    if (this.eventSectionsDelete == null) {
      this.eventSectionsDelete = this.ea.subscribe(
        EventNames.Templates.DELETE_SECTION,
        (model: Section) => {
          this.listOfSections = this.listOfSections.filter((section) => {
            return section.model !== model;
          });
          this.saveTemplate();
        }
      );
    }

    if (this.eventApiErrorDialogOpen == null) {
      this.eventApiErrorDialogOpen = this.ea.subscribe(
        EventNames.Api.API_ERROR_DIALOG_OPEN,
        () => {
          this.errorIsOpen = true;
        }
      );
    }

    if (this.eventApiErrorDialogClosed == null) {
      this.eventApiErrorDialogClosed = this.ea.subscribe(
        EventNames.Api.API_ERROR_DIALOG_CLOSED,
        () => {
          this.hasFocus = this.focusToTitle;
          this.focusToTitle = false;
          this.errorIsOpen = false;
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.eventSections != null) {
      this.eventSections.dispose();
      this.eventSections = null;
    }

    if (this.eventSectionsDelete != null) {
      this.eventSectionsDelete.dispose();
      this.eventSectionsDelete = null;
    }

    if (this.eventApiErrorDialogClosed != null) {
      this.eventApiErrorDialogClosed.dispose();
      this.eventApiErrorDialogClosed = null;
    }
  }

  /** Populate all dropdown selections from API response */
  private async loadDropdowns(): Promise<void> {
    const typePromise = this.templateService
      .getAssessmentTypeList()
      .then((types) => {
        this.typeDropdownItems = types;
      });

    const levelPromise = this.templateService
      .getAssessmentLevelList()
      .then((levels) => {
        this.levelDropdownItems = levels;
      });

    const themePromise = this.themeService.getThemeList().then((themes) => {
      this.themeDropdownItems = themes;
    });

    // Wait for all API calls to complete
    await Promise.all([typePromise, levelPromise, themePromise]);
  }

  /** Sets currently selected dropdown items with template info */
  private setDefaultDropdowns(): void {
    this.selectedLevelItem = this.template.level;

    this.selectedTypeItem = this.typeDropdownItems.find(
      (x) => x.name == this.template.templateType
    );

    if (this.template.theme != null) {
      this.selectedThemeItem = this.themeDropdownItems.find(
        (x) => x.themeName == this.template.theme.themeName
      );
    }
  }

  /** Set default theme when none selected */
  private setDefaultTheme(): void {
    if (!this.selectedThemeItem) {
      this.selectedThemeItem = this.themeDropdownItems.find(
        (x) => x.defaultTheme
      );
    }
  }

  /** Populates template sections with provided template */
  private async loadTemplate(): Promise<void> {
    this.listOfSections = [];

    this.template = await this.templateService.getTemplate(this.templateTitle);
    this.template.templateSections
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .forEach((templateSection) => {
        const section = new DynamicControl(
          "template-section",
          templateSection.id,
          new Section(
            templateSection.id,
            templateSection.sectionTitle,
            templateSection.hasSectionRating,
            []
          )
        );

        templateSection.controls.forEach((sectionControl) => {
          const control = new DynamicControl(
            "section-control",
            sectionControl.sortId,
            new SectionControlModel(
              sectionControl.sortId,
              templateSection.id,
              sectionControl.name,
              sectionControl.question,
              sectionControl.description,
              sectionControl.displayType,
              sectionControl.answerOptions,
              sectionControl.enableGroupControls,
              sectionControl.groupControls
            )
          );

          section.model.controlsAndSubheaders.push(control);
        });

        templateSection.subHeaders.forEach((sectionSubheader) => {
          const subHeader = new DynamicControl(
            "section-subheader",
            sectionSubheader.sortId,
            new SectionSubHeaderModel(
              sectionSubheader.sortId,
              templateSection.id,
              sectionSubheader.value
            )
          );

          section.model.controlsAndSubheaders.push(subHeader);
        });

        this.listOfSections.push(section);
      });

    this.sectionID =
      this.listOfSections.length > 0
        ? this.listOfSections[this.listOfSections.length - 1].model.id
        : 0;
  }

  /** Checks all required fields in the template */
  private async validateTemplate(): Promise<boolean> {
    let valid = true;

    if (!this.selectedTypeItem) {
      this.typeErrors = [];
      this.typeErrors.push("Assessment Type is required");
      valid = false;
    } else {
      this.typeErrors = [];
    }

    if (!this.selectedLevelItem) {
      this.levelErrors = [];
      this.levelErrors.push("Assessment Level is required");
      valid = false;
    } else {
      this.levelErrors = [];
    }

    if (!this.selectedThemeItem) {
      this.themeErrors = [];
      this.themeErrors.push("Assessment Theme is required");
      valid = false;
    } else {
      this.themeErrors = [];
    }

    this.listOfSections.map((x) => {
      const section: Section = x.model;

      if (!section.title) {
        section.validTitle = false;
        valid = false;
      } else {
        section.validTitle = true;
      }
      this.ea.publish(`${EventNames.Templates.SECTION_INVALID}:${section.id}`);

      section.controlsAndSubheaders
        .filter((f) => f.type == "section-subheader")
        .map((sh) => {
          const subheader: SectionSubHeaderModel = sh.model;

          if (!subheader.value) {
            subheader.validSubHeader = false;
            valid = false;
          } else {
            subheader.validSubHeader = true;
          }
          this.ea.publish(
            `${EventNames.Templates.SUBHEADER_INVALID}:${section.id}:${subheader.sortId}`
          );
        });

      section.controlsAndSubheaders
        .filter((f) => f.type == "section-control")
        .map((sc) => {
          const isNotValid = sc.model.answerOptions.some(
            (option: AnswerOption) => option.calculateScore && option.score < 0
          );

          if (isNotValid) {
            sc.model.validScore = false;
            valid = false;
          } else {
            sc.model.validScore = true;
          }

          this.ea.publish(
            `${EventNames.Templates.CONTROL_INVALID}:${section.id}:${sc.sortId}`
          );
        });
    });

    return valid;
  }

  /** Creates template object to send to API */
  private buildTemplate(publish: boolean): SaveTemplateRequest {
    return new SaveTemplateRequest(
      this.previousTitle,
      this.templateTitle.trim(),
      null,
      this.template?.notes ? this.template.notes : "",
      publish ? TemplateStatus.Published : TemplateStatus.Draft,
      this.selectedTypeItem ? this.selectedTypeItem.lineItemTypeID : "",
      "",
      this.selectedLevelItem ? this.selectedLevelItem : "",
      this.selectedThemeItem ? this.selectedThemeItem : null,
      this.listOfSections.map(function (x) {
        const templateSection = new TemplateSection(
          x.model.sectionRatingScore,
          x.model.controlsAndSubheaders
            .filter((f) => f.type == "section-subheader")
            .map(function (y) {
              return new SubHeader(y.model.sortId, y.model.value);
            }),
          x.model.controlsAndSubheaders
            .filter((f) => f.type == "section-control")
            .map(function (y) {
              return new SectionControl(
                y.model.sortId,
                y.model.enableGroupControls,
                y.model.groupControls,
                y.model.name,
                y.model.question,
                y.model.description,
                y.model.displayType,
                null,
                y.model.answerOptions
              );
            }),
          x.model.id,
          x.model.title,
          x.model.hasSectionRating
        );
        return templateSection;
      })
    );
  }

  get pageTitle(): string {
    if (this.templateTitle) {
      return "Edit Template";
    }

    return "New Template";
  }
}
