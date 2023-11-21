import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { fromEvent, Subscription } from 'rxjs';

import { AddNewGroupTranslationTokens } from './add-new-group.translation';

@Component({
  selector: 'hxgn-commonkeywords-add-new-group',
  templateUrl: 'add-new-group.component.html',
  styleUrls: ['add-new-group.component.scss']
})

export class AddNewGroupComponent {

  /**Event that is fired when a new valid group is added */
  @Output() groupAdded = new EventEmitter<string>();

  /** Reference to add new group input box */
  @ViewChild('addNewGroup', { static: true }) addNewGroupInp: ElementRef;

  /** The name of the group to be added */
  newGroupName: string = null;

  /** Reference to the add new group global subscription */
  addNewGroupSub: Subscription;

  /** Expose AddNewGroupTranslationTokens to HTML */
  tokens: typeof AddNewGroupTranslationTokens = AddNewGroupTranslationTokens;

  constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

  /**
    * Start the process of adding a new group
    */
  async startNewGroup() {
    this.newGroupName = await this.localizationAdapter.getTranslationAsync(AddNewGroupTranslationTokens.untitledGroup);

    // Break angular tick
    setTimeout(() => {
      this.addNewGroupInp.nativeElement.focus();
      this.addNewGroupInp.nativeElement.select();
      this.enableGlobalAdd();
    });
  }

  /**
   * Add new rule group
   */
  createNewGroup() {
    if (this.validateNewNode()) {
      this.groupAdded.emit(this.newGroupName);
      this.disableGlobalAdd();
      this.newGroupName = null;
    }
  }

  /** Disable global add new group */
  disableGlobalAdd() {
    // Wait for next tick
    setTimeout(() => {
      this.addNewGroupSub?.unsubscribe();
    });
  }

  /** Enable global add new group */
  enableGlobalAdd() {
    this.addNewGroupSub?.unsubscribe();

    // Set up event on document
    this.addNewGroupSub = fromEvent(document, 'click').subscribe(click => {
      this.createNewGroup();
    });
  }

  /** Cancels adding a new group */
  cancelAddGroup() {
    this.newGroupName = null;

    // Wait for angular tick
    this.disableGlobalAdd();
  }

  /**
   * Returns true if the node name is valid
   */
  private validateNewNode(): boolean {
    if (!this.newGroupName?.trim()) {
      return false;
    }
    return true;
  }
}
