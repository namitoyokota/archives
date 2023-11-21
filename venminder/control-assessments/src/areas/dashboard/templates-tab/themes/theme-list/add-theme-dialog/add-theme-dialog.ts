import { DialogController } from "aurelia-dialog";
import { computedFrom, inject } from "aurelia-framework";
import { TemplateTheme } from "services/models/themes/theme";
import { ThemeService } from "services/theme-service";

export class AddThemeDialog {
  filesList: FileList;
  fileName = "";
  hasFileError = false;
  themeName = "";
  themeDescription = "";
  defaultTheme = false;
  private fileBytesB64 = "";
  private extension = "";

  @computedFrom("hasFileError", "fileName", "themeName")
  get canSave(): boolean {
    return (
      !this.hasFileError &&
      this.fileName.length > 0 &&
      this.themeName.length > 0
    );
  }

  constructor(
    @inject(DialogController)
    private readonly dialogController: DialogController,
    @inject(ThemeService) private readonly themeService: ThemeService
  ) {}

  openBrowse(): boolean {
    document.getElementById("addThemeBrowseFiles").click();
    return false;
  }

  async addFile(): Promise<void> {
    this.hasFileError = false;

    this.fileName = this.filesList[0].name;
    this.extension = this.fileName.slice(this.fileName.indexOf(".") + 1);
    const arrayBuffer = await this.filesList[0].arrayBuffer();

    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileBytesB64 = window.btoa(binary);
    if (this.extension !== "zip") {
      this.hasFileError = true;
    }
  }

  async submit(): Promise<boolean> {
    const theme = new TemplateTheme(
      this.themeName,
      this.fileName,
      this.extension,
      new Date(),
      this.themeDescription,
      this.defaultTheme,
      [],
      this.fileBytesB64
    );
    return await this.themeService
      .saveTheme(theme)
      .then(() => {
        this.dialogController.close(true);
        return true;
      })
      .catch((e) => {
        this.hasFileError = true;
        return false;
      });
  }
}
