import { inject } from "aurelia-framework";
import { TagAutocompleteService } from "services/tag-autocomplete-service";

export class ControlTags {
  tagList: string[] = [];
  currentTag: string;

    constructor(@inject(TagAutocompleteService) readonly tagSuggestionService: TagAutocompleteService // Used in  HTML's autocomplete element
    ) {
  }

  handleKeypress($event: KeyboardEvent): void {
    if ($event.code === "Enter") {
      this.addTag();
    }

    $event.preventDefault();
  }

  removeTag(tag: string): void {
    this.tagList = this.tagList.filter((t) => t !== tag);
  }

  /** Resets tag inputs (used by new-control) */
  public clear(): void {
    this.currentTag = "";
    this.tagList = [];
  }

  /** Returns list of tags (used by new-control) */
  public getAll(): string[] {
    return this.tagList;
  }

  private addTag(): void {
    const tagToAdd = this.currentTag?.trim().toLowerCase();
    if (tagToAdd?.length) {
      const alreadyInList = this.tagList.includes(tagToAdd);
      if (!alreadyInList) {
        this.tagList = [...this.tagList, tagToAdd];
      }

      this.currentTag = "";
    }
  }
}
