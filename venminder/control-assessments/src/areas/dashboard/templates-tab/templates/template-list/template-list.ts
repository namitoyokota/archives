import { inject } from "aurelia-dependency-injection";
import { DialogCloseResult, DialogService } from "aurelia-dialog";
import { Router } from "aurelia-router";
import { Template } from "services/models/templates/template";
import { TemplateSection } from "services/models/templates/template-section";
import { TemplateService } from "services/template-service";
import {
  ActionEllipsisColumn,
  DateColumn,
  LiteralColumn,
} from "shared-from-dcdev/resources/features/vm-grid-v2/configuration/gridColumns";
import { VmGridDataManaged } from "shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-managed";
import { VmGridPagination } from "shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-pagination";
import type {
  IVmGridActionEventArgs,
  IVmGridConfig,
} from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";
import { ConfirmDialog } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog.component";
import { DateFormats } from "shared-from-dcdev/shared/enums/date-formats";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { TemplateStatus } from "shared/enums/template-statuses";

class TemplatesGridData extends VmGridDataManaged {
  constructor() {
    super([], new VmGridPagination(1, 0, 0, 0, 0, 25));
  }
}

class TemplateData extends Template {
  constructor(
    public templateTitle: string = "",
    public updated: Date = null,
    public notes: string = null,
    public status: TemplateStatus = TemplateStatus.Draft,
    public templateType: string = "",
    public client: string = "",
    public level: string = "",
    public templateSections: TemplateSection[] = [],
    public statusDescription: string = "",
    public isPublished: boolean = false
  ) {
    super(
      templateTitle,
      updated,
      notes,
      status,
      templateType,
      client,
      level,
      templateSections
    );
  }

  static create(item: Template = null, preserveNull = false): TemplateData {
    return item == null
      ? preserveNull
        ? null
        : new TemplateData()
      : new TemplateData(
          item.templateTitle,
          item.updated,
          item.notes,
          item.status,
          item.templateType,
          item.client,
          item.level,
          item.templateSections,
          TemplateStatus[item.status],
          item.status == TemplateStatus.Published
        );
  }
}

export class TemplateList {
  gridConfig: IVmGridConfig | undefined;
  templateListLoaded = false;
  readonly gridData = new TemplatesGridData();

  constructor(
    @inject(Router) private readonly router: Router,
    @inject(TemplateService) private readonly templateService: TemplateService,
    @inject(DialogService) private readonly dialogService: DialogService
  ) {}

  async attached(): Promise<void> {
    this.templateListLoaded = false;
    this.gridConfig = this.prepareTemplateGrid();
    const templateData = await (
      await this.templateService.getTemplateList()
    ).map((x) => {
      return TemplateData.create(x);
    });
    this.gridData
      .init({
        data: templateData,
        config: this.gridConfig,
        userSettings: null,
        dynamicColumns: [],
      })
      .set({
        order: [
          {
            Name: "Template Name",
            Direction: "asc",
            OrderBy: "name",
          },
        ],
      });
    this.templateListLoaded = true;
  }

  private deleteSectionItem(title: string): void {
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.create("template"),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          this.templateService.deleteTemplate(title);
          this.gridData.rows = this.gridData.rows.filter(
            (row) => row.templateTitle != title
          );
        }
      });
  }
  navigateToCreateTemplate(): void {
    this.router.navigate(`/templates/template-builder/template-new`);
  }

  private navigateToEditTemplate(title: string): void {
    this.router.navigate(
      `/templates/template-builder/template-edit/${encodeURIComponent(title)}`
    );
  }

  private navigateToDupeTemplate(title: string): void {
    const newTitle = title + " (COPY)";

    this.templateService
      .dupeTemplate(title, newTitle)
      .then(() =>
        this.router.navigate(
          `/templates/template-builder/template-edit/${encodeURIComponent(
            newTitle
          )}`
        )
      );
  }

  private prepareTemplateGrid(): IVmGridConfig {
    const gridConfig: IVmGridConfig = {
      ID: "templateListGrid",
      ColumnDefinitions: [
        new LiteralColumn(
          "templateTitle",
          "minmax(300px, 2fr)",
          "Template Name"
        ).SetDefaults({ AllowSorting: true }),

        new LiteralColumn(
          "templateType",
          "minmax(100px, 2fr)",
          "Template Type"
        ).SetDefaults({ AllowSorting: true }),

        new LiteralColumn("client", "minmax(100px, 2fr)", "Client").SetDefaults(
          { AllowSorting: true }
        ),

        new LiteralColumn("level", "minmax(100px, 1fr)", "Level").SetDefaults({
          AllowSorting: true,
        }),

        new DateColumn("updated", "minmax(100px, 1fr)", "Updated")
          .SetDefaults({ AllowSorting: true })
          .SetFormatting(DateFormats.DATE_SEP_SLASH),

        new LiteralColumn(
          "statusDescription",
          "minmax(100px, 1fr)",
          "Status"
        ).SetDefaults({ AllowSorting: true }),

        new ActionEllipsisColumn()
          .setDefaults({
            commandItems: [
              {
                text: "Edit",
                checkVisibility: (row: TemplateData) => {
                  return !row.isPublished;
                },
              },
              { text: "Duplicate" },
              { text: "Delete" },
            ],
          })
          .onClick((args: IVmGridActionEventArgs) => {
            switch (args.command.text) {
              case "Edit":
                this.navigateToEditTemplate(args.row.templateTitle);
                break;
              case "Duplicate":
                this.navigateToDupeTemplate(args.row.templateTitle);
                break;
              case "Delete":
                this.deleteSectionItem(args.row.templateTitle);
                break;
            }
          }),
      ],
      NoResultsMessage: "No Assessment Templates have been created yet",
    };

    return gridConfig;
  }
}
