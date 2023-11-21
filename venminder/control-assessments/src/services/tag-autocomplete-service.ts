import { inject } from "aurelia-dependency-injection";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import type { AutocompleteService } from "services/interfaces/autocomplete-service";
import { TagService } from "services/tag-service";
import { EventNames } from "../shared/event-names";

export class TagAutocompleteService implements AutocompleteService {
  /** All tags returned from the API */
  existingTags: string[];
  private refreshtagList: Subscription = null;

  constructor(
    @inject(TagService) private readonly tagService: TagService,
    @inject(EventAggregator) private readonly ea: EventAggregator
  ) {
    this.loadTagList();
    this.attachSubscriptions();
  }
  private async attachSubscriptions(): Promise<void> {
    if (this.refreshtagList === null) {
      this.refreshtagList = this.ea.subscribe(
        EventNames.Controls.REFRESH_LIST,
        async () => {
          await this.loadTagList();
        }
      );
    }
  }

  private async loadTagList(): Promise<void> {
    await this.tagService.getTags("").then((tags) => {
      this.existingTags = tags;
    });
  }

  /** Returns possible tags from current input */
  async suggest(value: string): Promise<string[]> {
    return value === ""
      ? Promise.resolve([])
      : Promise.resolve(
          this.existingTags.filter((t) =>
            t.toLowerCase().startsWith(value.toLowerCase())
          )
        );
  }
}
