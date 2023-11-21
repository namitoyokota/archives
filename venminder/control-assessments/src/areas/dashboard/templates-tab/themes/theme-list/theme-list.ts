import { inject } from "aurelia-dependency-injection";
import { DialogCloseResult, DialogService } from "aurelia-dialog";
import { TemplateTheme } from "services/models/themes/theme";
import { TemplateService } from "services/template-service";
import { ThemeService } from "services/theme-service";
import {
  ActionEllipsisColumn,
  BooleanColumn,
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
import { CSVHelper } from "shared-from-dcdev/shared/utilities/csv-helper";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { AddThemeDialog } from "./add-theme-dialog/add-theme-dialog";

class ThemeGridData extends VmGridDataManaged {
  constructor() {
    super([], new VmGridPagination(1, 0, 0, 0, 0, 25));
  }
}

interface IGridData {
  folder: boolean;
  name: string;
  fileName: string;
  themeName: string;
  themeNameForOrder: string;
  fileType: string;
  dateAdded: Date;
  description: string;
  defaultTheme: boolean;
  fileList: string[];
}

export class ThemeList {
  /** List of themes to display */
  gridData = new ThemeGridData();

  /** Configuration for the grid component */
  gridConfig: IVmGridConfig | undefined;

  /** Current string in the search input */
  searchString = "";

  /** Current loading status */
  loading = true;

  /** List of all themes returned from the API */
  private allThemeList: TemplateTheme[] = [];

  /** List of currently displayed theme list (used for search purposes) */
  private themeList: TemplateTheme[] = [];

  constructor(
    @inject(TemplateService) private readonly templateService: TemplateService,
    @inject(ThemeService) private readonly themeService: ThemeService,
    @inject(DialogService) public readonly dialogService: DialogService
  ) {}

  /** Attached lifecycle hook */
  async attached(): Promise<void> {
    this.setThemeConfig();
    await this.setThemeList();
    this.setGridData();

    this.loading = false;
  }

  /** Triggered on add theme button click */
  addTheme(): void {
    this.dialogService
      .open({ viewModel: AddThemeDialog })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.setThemeList();
        }
      });
  }

  /** Triggered on template ids button click */
  async loadTemplateIDsFile(): Promise<void> {
    const csvHelper = new CSVHelper();
    const placeholderList = await this.templateService.getPlaceholderList();
    const csv = csvHelper.convertJStoCSV(placeholderList);
    csvHelper.downloadCsv({
      csv,
      filename: "Control Assessments Placeholder List",
    });
  }

  /** Triggered on search input changed */
  search(searchString?: string): void {
    // Ignore if re-search after theme list updated
    if (searchString !== undefined) {
      this.searchString = searchString.trim();
    }

    // Don't search on empty string
    if (this.searchString) {
      this.themeList = this.allThemeList.filter((theme: TemplateTheme) => {
        const fileNameMatch = theme.fileName
          .toLowerCase()
          .includes(this.searchString.toLowerCase());
        const themeNameMatch = theme.themeName
          .toLowerCase()
          .includes(this.searchString.toLowerCase());

        const matchingFileList = theme.fileList?.filter((fileName) =>
          fileName.toLowerCase().includes(this.searchString.toLowerCase())
        );
        const fileListMatch = !!matchingFileList?.length;

        return fileNameMatch || themeNameMatch || fileListMatch;
      });
    } else {
      this.themeList = this.allThemeList;
    }

    this.setGridData();
  }

  /** Retrieves theme list from the API */
  private async setThemeList(): Promise<void> {
    this.allThemeList = await this.themeService.getThemeList();
    this.search();
  }

  /** Sets grid data from the theme list */
  private setGridData(): void {
    const gridData: IGridData[] = [];

    this.themeList.forEach((x) => {
      try {
        x.fileList.forEach((y) => {
          gridData.push({
            folder: false,
            name: y,
            fileName: x.fileName,
            themeName: x.themeName,
            themeNameForOrder: `${x.themeName}1`,
            fileType: y.split(".")[1],
            dateAdded: new Date(x.createDate),
            description: "",
            defaultTheme: false,
            fileList: x.fileList,
          });
        });
      } catch {
        gridData.push({
          folder: false,
          name: x.fileName,
          fileName: x.fileName,
          themeName: x.themeName,
          themeNameForOrder: `${x.themeName}1`,
          fileType: x.fileType,
          dateAdded: new Date(x.createDate),
          description: "",
          defaultTheme: false,
          fileList: x.fileList,
        });
      }
    });

    this.themeList
      .filter(
        (value, index, self) =>
          self.map((x) => x.themeName).indexOf(value.themeName) === index
      )
      .map((x) => {
        gridData.push({
          folder: true,
          name: x.themeName,
          fileName: x.fileName,
          themeName: x.themeName,
          themeNameForOrder: `${x.themeName}0`,
          fileType: x.fileType,
          dateAdded: new Date(x.createDate),
          description: x.description,
          defaultTheme: x.defaultTheme,
          fileList: x.fileList,
        } as IGridData);
      });

    this.gridData
      .init({
        data: gridData.sort((a, b) =>
          a.themeNameForOrder > b.themeNameForOrder ? 1 : -1
        ),
        config: this.gridConfig,
        userSettings: null,
        dynamicColumns: [],
      })
      .set({
        order: [
          {
            Name: "Theme Name",
            Direction: "asc",
            OrderBy: "themeNameForOrder",
          },
        ],
      });
  }

  /** Sets configuration for grid component */
  private setThemeConfig(): void {
    this.gridConfig = {
      ID: "themeListGrid",
      ColumnDefinitions: [
        new BooleanColumn(
          "folder",
          "minmax(10px, min-content)",
          ""
        ).SetFormatting(`<span class="fas fa-caret-down fa-lg" />`, ""),
        new LiteralColumn("name", "minmax(300px, 2fr)", "Name").SetDefaults({
          AllowSorting: true,
        }),
        new LiteralColumn(
          "fileType",
          "minmax(100px, 2fr)",
          "File Type"
        ).SetDefaults({ AllowSorting: true }),
        new DateColumn("dateAdded", "minmax(200px, 1fr)", "Date Added")
          .SetDefaults({ AllowSorting: true })
          .SetFormatting(DateFormats.DATE_SEP_SLASH),
        new LiteralColumn(
          "description",
          "minmax(300px, 2fr)",
          "Description"
        ).SetDefaults({ AllowSorting: true }),
        new BooleanColumn("defaultTheme", "minmax(30px, 2fr)", "Default")
          .SetDefaults({ AllowSorting: true })
          .SetFormatting(`<span class="fas fa-check-circle green" />`, ""),

        new ActionEllipsisColumn()
          .setDefaults({
            commandItems: [{ text: "Delete" }],
          })
          .onClick((args: IVmGridActionEventArgs) => {
            switch (args.command.text) {
              case "Delete":
                this.deleteSectionItem(args.row.themeName, args.row.fileName);
                break;
            }
          }),
      ],
      NoResultsMessage: "No Assessment Themes Found",
    } as IVmGridConfig;
  }

  private async deleteSectionItem(
    themeName: string,
    fileName: string
  ): Promise<void> {
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.createBase(
          `Are you sure you want to delete this theme? Deleting this theme will not impact any templates it is currently associated with;
           however, you will not be able to use it in the future.`
        ),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          await this.themeService
            .deleteTheme(themeName, fileName)
            .then(
              () =>
                (this.gridData.rows = this.gridData.rows.filter(
                  (row) =>
                    row.themeName != themeName && row.fileName != fileName
                ))
            );
        }
      });
  }
}
