import { Observable } from 'rxjs';

export interface DirtyComponent$v1 {

    /** Option to disable save changes button in dialog. */
    disabledSave$?: Observable<boolean>;

    /** Whether or not changes have been made. */
    isDirty$: Observable<boolean>;

    /** Function to save changes. */
    saveChangesAsync(): Promise<void>;
}
