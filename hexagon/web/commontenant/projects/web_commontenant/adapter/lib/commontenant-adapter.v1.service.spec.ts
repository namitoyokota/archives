import { CommontenantMailboxService } from '@galileo/web_commontenant/_common';
import { filter, first } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from './commontenant-adapter.v1.service';


describe('CommontenantAdapterService$v1', () => {
    let srv: CommontenantAdapterService$v1;
    let mailboxSrv: CommontenantMailboxService;

    beforeEach(() => {
        mailboxSrv = new CommontenantMailboxService();
        mailboxSrv.mailbox$v1.coreIsLoaded$.next(true);
        srv = new CommontenantAdapterService$v1(mailboxSrv);
    });

    it('should get capability list', async () => {
        mailboxSrv.mailbox$v1.getCapabilityList$.pipe(
            filter(mb => mb !== null),
            first())
            .subscribe(mb => {
                if (!mb) { return; }
                mb.response.next([ { id: 'test 1'} ]);
            });

        const list = await srv.getCapabilityListAsync();
        expect(list.length).toEqual(1);
    });

    it('should get data access map', async () => {
        mailboxSrv.mailbox$v1.getDataAccessMap$.pipe(
            filter(mb => mb !== null),
            first())
            .subscribe(mb => {
                mb.response.next(['test']);
            });

        const list = await srv.getDataAccessMapAsync('test');
        expect(list.length).toEqual(1);
    });

});
