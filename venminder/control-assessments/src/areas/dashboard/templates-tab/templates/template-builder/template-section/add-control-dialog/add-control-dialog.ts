import { Control } from "areas/dashboard/models/add-control";
import {
  DialogCloseResult,
  DialogController,
  DialogService,
} from "aurelia-dialog";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { inject } from "aurelia-framework";
import { ControlService } from "services/control-service";
import { SectionControl } from "services/models/templates/section-control";
import { Template } from "services/models/templates/template";
import { TemplateSection } from "services/models/templates/template-section";
import { TemplateService } from "services/template-service";
import { ConfirmDialog } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { EventNames } from "shared/event-names";

export class AddControlDialog {
  // #region HTML fields
  selectAll = false;
  controlsList: Control[];
  areAnyControlsSelected = false;
  // #endregion

  // #region typescript fields
  private fullControlsList: Control[];
  private refreshControlsList: Subscription = null;
  private tagSelected: Subscription = null;
  // #endregion

  // #region component lifecycle methods
  constructor(
    @inject(ControlService) private readonly controlService: ControlService,
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(DialogController)
    private readonly dialogController: DialogController,
    @inject(DialogService) private readonly dialogService: DialogService,
    @inject(TemplateService) private readonly templateService: TemplateService
  ) {}

  async activate(): Promise<void> {
    await this.loadControlList();
  }

  async attached(): Promise<void> {
    await this.attachSubscriptions();
  }

  detached(): void {
    this.detachSubscriptions();
  }

  private async attachSubscriptions(): Promise<void> {
    if (this.refreshControlsList === null) {
      this.refreshControlsList = this.ea.subscribe(
        EventNames.Controls.REFRESH_LIST,
        async () => {
          await this.loadControlList();
        }
      );
    }
    if (this.tagSelected === null) {
      this.tagSelected = this.ea.subscribe(
        EventNames.Controls.TAG_SELECTED,
        async (tags: string[]) => {
          await this.filterControls(tags);
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.refreshControlsList !== null) {
      this.refreshControlsList.dispose();
      this.refreshControlsList = null;
    }
  }

  private async loadControlList(): Promise<void> {
    this.controlsList = (await this.controlService.getControlList())
      .map((c: Control) => {
        c.isSelected = false;
        c.controlListTitle = (c.question ? c.question + " - " : "") + c.name;

        return c;
      })
      .sort((a, b) =>
        a.controlListTitle.toLowerCase() > b.controlListTitle.toLowerCase()
          ? 1
          : -1
      );
    this.fullControlsList = this.controlsList;
  }
  // #endregion

  // #region HTML methods
  submit(): void {
    const selectedControls = this.controlsList.filter(
      (control) => control.isSelected
    );
    this.dialogController.ok({
      newSectionControls: selectedControls,
    });
  }

  handleAllControlsSelected(): void {
    this.controlsList.forEach((c) => (c.isSelected = this.selectAll));
    this.updateAreAnyControlsSelected();
  }

  handleControlSelected(): void {
    this.updateAreAnyControlsSelected();
  }

  async deleteControl(control: Control): Promise<void> {
    const templateCount = (await this.templateService.getTemplateList()).filter(
      (t: Template) =>
        t.templateSections.some((s: TemplateSection) =>
          s.controls.find(
            (c: SectionControl) =>
              c.name === control.name && c.question === control.question
          )
        )
    ).length;
    let moreInfo = `The control will remain in any templates you have already created, but you will not be able to use it going forward. `;
    if (templateCount > 0) {
      moreInfo += `It is currently in use on <b>${templateCount} template(s)</b>. `;
    }
    moreInfo += `If you want to remove it from a template, please edit that template directly.`;
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.createVerbose("control", moreInfo),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          await this.controlService.deleteControl(control).then(async () => {
            this.ea.publish(EventNames.Controls.REFRESH_LIST);
          });
        }
      });
  }
  // #endregion

  // #region private typescript methods
  private filterControls(tags: string[]): void {
    this.controlsList = this.fullControlsList.filter((c: Control) =>
      tags.every((t: string) => c.tags.includes(t))
    );
    this.updateAreAnyControlsSelected();
  }

  private updateAreAnyControlsSelected(): void {
    const count = this.countControlsSelected();
    this.areAnyControlsSelected = this.controlsList != null && count > 0;
    this.selectAll = count === this.controlsList.length;
  }

  private countControlsSelected(): number {
    return this.controlsList.filter((c) => c.isSelected).length;
  }
  // #endregion
}
