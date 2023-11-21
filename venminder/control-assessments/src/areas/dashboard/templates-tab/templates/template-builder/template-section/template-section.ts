import { Control } from "areas/dashboard/models/add-control";
import { Section } from "areas/dashboard/models/section";
import { SectionControlModel } from "areas/dashboard/models/section-control-model";
import { DialogCloseResult, DialogService } from "aurelia-dialog";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { inject } from "aurelia-framework";
import { bindable } from "aurelia-templating";
import { SectionControl } from "services/models/templates/section-control";
import { ConfirmDialog } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { EventNames } from "shared/event-names";
import { DynamicControl } from "shared/models/dynamic-control";
import { SectionSubHeaderModel } from "shared/models/section-sub-header-model";
import { AddControlDialog } from "./add-control-dialog/add-control-dialog";

export class TemplateSection {
  @bindable model: Section;

  titleErrors: string[] = [];

  private itemID = 0;
  private previousTitle: string;

  private eventSubHeaders: Subscription = null;
  private eventControls: Subscription = null;
  private eventInvalid: Subscription = null;

  // TODO: Get this working instead of using eventInvalid Event Aggregator
  // @computedFrom('model.validTitle')
  // private performValidation() {
  // 	if (!this.model.validTitle) {
  // 		this.titleErrors.push('Section title is required');
  // 	} else {
  // 		this.titleErrors = [];
  // 	}
  // }

  constructor(
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(DialogService) private readonly dialogService: DialogService
  ) {}

  attached(): void {
    if (this.model != null) {
      this.previousTitle = this.model.title;
      this.attachSubscriptions();
      this.model.controlsAndSubheaders = this.model.controlsAndSubheaders.sort(
        (a, b) => (a.model.sortId > b.model.sortId ? 1 : -1)
      );
      this.itemID =
        this.model.controlsAndSubheaders.length > 0
          ? this.model.controlsAndSubheaders[
              this.model.controlsAndSubheaders.length - 1
            ].model.sortId
          : 0;
      this.dataModelChanged();
    }
  }

  detached(): void {
    this.detachSubscriptions();
  }

  changeTitle(): void {
    this.model.title = this.model.title == null ? "" : this.model.title.trim();
    if (this.previousTitle !== this.model.title) {
      this.dataModelChanged();
    }
  }

  addSubheader(): void {
    this.itemID += 1;
    this.model.controlsAndSubheaders.push(
      new DynamicControl(
        "section-subheader",
        this.itemID,
        new SectionSubHeaderModel(this.itemID, this.model.id, null)
      )
    );
    this.dataModelChanged();
  }

  deleteSection(): void {
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.create("section"),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          this.ea.publish(EventNames.Templates.DELETE_SECTION, this.model);
        }
      });
  }

  addControl(): void {
    this.dialogService
      .open({ viewModel: AddControlDialog })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          response.output.newSectionControls.forEach((c: Control) =>
            this.addControlToList(
              new SectionControl(
                null,
                false,
                false,
                c.name,
                c.question,
                c.description,
                c.displayType,
                c.tags,
                c.answerOptions
              )
            )
          );
          this.dataModelChanged();
        }
      });
  }

  deleteSectionItem(item: DynamicControl): void {
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.create("control/subheader"),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          const itemIndex = this.model.controlsAndSubheaders.indexOf(item);
          this.model.controlsAndSubheaders.splice(itemIndex, 1);

          if (this.model.controlsAndSubheaders.length > itemIndex) {
            const nextControl =
              this.model.controlsAndSubheaders[itemIndex].model;
            const enableGroupControls = this.checkEnableGroupControls(
              new SectionControl(
                null,
                nextControl.enableGroupControls,
                false,
                null,
                null,
                null,
                nextControl.displayType
              ),
              itemIndex + 1
            );

            nextControl.groupControls = enableGroupControls
              ? nextControl.groupControls
              : false;

            nextControl.enableGroupControls = enableGroupControls;
          }

          this.dataModelChanged();
        }
      });
  }

  sectionRatingSelected(): void {
    this.dataModelChanged();
  }

  private attachSubscriptions(): void {
    if (this.eventSubHeaders == null) {
      this.eventSubHeaders = this.ea.subscribe(
        `${EventNames.Templates.SECTIONS_SUBHEADER}:${this.model.id}`,
        (model: SectionSubHeaderModel) => {
          const itemIndex = this.model.controlsAndSubheaders.findIndex(
            (x) => x.model.sortId == model.sortId
          );
          this.model.controlsAndSubheaders[itemIndex].model = model;
          this.dataModelChanged();
        }
      );
    }

    if (this.eventControls == null) {
      this.eventControls = this.ea.subscribe(
        `${EventNames.Templates.SECTIONS_CONTROL}:${this.model.id}`,
        (model: SectionControlModel) => {
          const itemIndex = this.model.controlsAndSubheaders.findIndex(
            (x) => x.model.sortId == model.sortId
          );
          this.model.controlsAndSubheaders[itemIndex].model = model;
          this.dataModelChanged();
        }
      );
    }

    if (this.eventInvalid == null) {
      this.eventInvalid = this.ea.subscribe(
        `${EventNames.Templates.SECTION_INVALID}:${this.model.id}`,
        () => {
          if (!this.model.validTitle) {
            this.titleErrors = [];
            this.titleErrors.push("Section title is required");
          } else {
            this.titleErrors = [];
          }
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.eventSubHeaders != null) {
      this.eventSubHeaders.dispose();
      this.eventSubHeaders = null;
    }
    if (this.eventControls != null) {
      this.eventControls.dispose();
      this.eventControls = null;
    }
    if (this.eventInvalid != null) {
      this.eventInvalid.dispose();
      this.eventInvalid = null;
    }
  }

  private dataModelChanged(): void {
    this.previousTitle = this.model.title;
    this.ea.publish(EventNames.Templates.SECTION_MODIFIED, this.model);
  }

  private addControlToList(newControl: SectionControl): void {
    this.itemID += 1;
    const enableGroupControls = this.checkEnableGroupControls(
      newControl,
      this.itemID
    );
    this.model.controlsAndSubheaders.push(
      new DynamicControl(
        "section-control",
        this.itemID,
        new SectionControlModel(
          this.itemID,
          this.model.id,
          newControl.name,
          newControl.question,
          newControl.description,
          newControl.displayType,
          newControl.answerOptions,
          enableGroupControls,
          newControl.groupControls
        )
      )
    );
  }

  private checkEnableGroupControls(
    control: SectionControl,
    id: number
  ): boolean {
    if (this.model.controlsAndSubheaders.length > 0) {
      if (!control.enableGroupControls.hasValue()) {
        const previousControls = this.model.controlsAndSubheaders.filter(
          (x) => x.model.sortId < id
        );

        if (previousControls.length > 0) {
          const previousControl =
            this.model.controlsAndSubheaders[previousControls.length - 1];
          return previousControl.model.displayType == control.displayType;
        }

        return false;
      }

      return control.enableGroupControls;
    }

    return false;
  }
}
