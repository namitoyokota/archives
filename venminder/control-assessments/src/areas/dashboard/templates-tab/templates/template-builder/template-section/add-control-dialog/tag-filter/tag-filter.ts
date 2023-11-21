import { TagModel } from "areas/dashboard/models/tag-model";
import { inject } from "aurelia-dependency-injection";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { TagService } from "services/tag-service";
import { EventNames } from "shared/event-names";

export class TagFilter {
  private displayText = "";
  private tagModelList: TagModel[] = [];
  private refreshtagList: Subscription = null;

  private constructor(
    @inject(TagService) private readonly tagService: TagService,
    @inject(EventAggregator) private readonly ea: EventAggregator
  ) {}

  private async attached(): Promise<void> {
    await this.loadTagList();
    await this.attachSubscriptions();
  }

  private async attachSubscriptions(): Promise<void> {
    if (this.refreshtagList === null) {
      this.refreshtagList = this.ea.subscribe(
        EventNames.Controls.REFRESH_LIST,
        async () => {
          await this.loadTagList();
          this.clearDisplayText();
        }
      );
    }
  }

  private async loadTagList(): Promise<void> {
    this.tagModelList = [];
    const tagList = await (
      await this.tagService.getTags("")
    ).sort((a, b) => (a > b ? 1 : -1));
    tagList.forEach((tl) => {
      const tag = new TagModel(tl, false);
      this.tagModelList.push(tag);
    });
  }

  onTagSelection(tag: TagModel): void {
    tag.checked = !tag.checked;
    const selectedTags = this.tagModelList
      .filter((tagList) => tagList.checked)
      .map((t) => t.tag);
    this.ea.publish(EventNames.Controls.TAG_SELECTED, selectedTags);
    this.updateDisplayText(selectedTags);
  }

  private updateDisplayText(selectedTags: string[]): void {
    this.displayText =
      selectedTags.length > 1
        ? selectedTags.length + " items selected"
        : selectedTags.length === 1
        ? (this.displayText = selectedTags[0])
        : (this.displayText = "");
  }

  private clearDisplayText(): void {
    this.displayText = "";
  }
}
