import type { Observable } from 'rxjs';
import type { VMContextMenu } from '../classes/vm-context-menu';

export interface IVMContextMenuService {
    close(contextMenu?: VMContextMenu): void;
    getContextMenuState(): Observable<VMContextMenu>;
    open(contextMenu: VMContextMenu): Observable<VMContextMenu>;
}
