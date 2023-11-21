/*tslint:disable*/
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    ChipColor,
    CommonConfirmDialogComponent,
    CommonErrorDialogComponent,
    CommonUnsavedChangesDialogComponent,
    FeatureFlags,
    Hyperlink$v1,
    ListStep,
    Media$v1,
    MediaURLFetcher,
    Person$v1,
    Remark$v1,
    FilterProperty$v2,
    FilterOperation$v2,
    FilterInputType$v2,
    FilterOperationType$v2,
    PostStyle$v1
} from '@galileo/web_common-libraries';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { UserInfo$v1 } from '@galileo/web_commonidentity/_common';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';

export class TestFetcher implements MediaURLFetcher {
    getEntityAttachments(entityId, tenantId) {
        return new Promise<Media$v1[]>(resolve => {
            resolve([])
        });
    }

    updateAttachment(entityId, attachmentId) {
        return new Promise<Media$v1>(resolve => {
            resolve(new Media$v1)
        });
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    FeatureFlags: typeof FeatureFlags = FeatureFlags;

    fetcher = new TestFetcher();

    activeLineType: LineType$v1 = LineType$v1.dashed;

    activeLineWeight: number = 3;

    activeColor = '#0071C1';

    steps: ListStep[] = [
        new ListStep('token', false, false, false),
        new ListStep('token', true, false, true, false),
        new ListStep('token', true, true, false, false),
        new ListStep('token', true, true, true),
        new ListStep('token', false, true, true),
        new ListStep('token', false, false, true)
    ];

    properties: Map<string, string> = new Map<string, string>([
        [
            'test1',
            'test2'
        ],
        [
            'Clifford was',
            'a big red dog'
        ],
        [
            'I\'m gonna get',
            'an ant tattoo.'
        ],
        [
            'Overflow',
            'test'
        ],
        [
            'update',
            'test'
        ]
    ]);

    cardSelected = false;

    title = 'common-lib';

    array = [];

    chunk = [];

    lastIndex = 0;

    contact: Person$v1 = new Person$v1({
        firstName: 'Test',
        middleName: 'A',
        lastName: 'Testerson',
        title: 'Tester',
        email: 'test@test.test'
    });

    files: File[] = [];

    uploadingFile = null;

    loadComplete = false;

    min: Date = new Date();
    max: Date = new Date('8/29/2022');

    showOpacityAndHex = false;

    filename = 'initial';

    scrollToBottom = new Subject<void>();

    remarks: Remark$v1[] = [
        new Remark$v1({
            authorFirstName: '',
            authorMiddleName: '',
            authorLastName: '',
            text: 'Hello, this is my first comment',
            createdTime: new Date(),
            priority: PostStyle$v1.normal
        } as Remark$v1),
        new Remark$v1({
            authorFirstName: 'Namito',
            authorMiddleName: '',
            authorLastName: 'Yokota',
            text: 'Hello, this is my second comment',
            createdTime: new Date(),
            priority: PostStyle$v1.important
        } as Remark$v1),
        new Remark$v1({
            authorFirstName: 'Namito',
            authorMiddleName: '',
            authorLastName: 'Yokota',
            text: 'Hello, this is my third comment',
            createdTime: new Date(),
            priority: PostStyle$v1.highPriority
        } as Remark$v1),
        new Remark$v1({
            authorFirstName: 'Namito',
            authorMiddleName: '',
            authorLastName: 'Yokota',
            text: 'Hello, this is my forth comment. akjhsdk lajhsjkdhga kjshdg kjahgsd kjhags dkjhga skjdhgkaj hg',
            createdTime: new Date(),
            priority: PostStyle$v1.critical
        } as Remark$v1)
    ]

    ChipColor: typeof ChipColor = ChipColor;

    mediaList = [
        new Media$v1({
            contentType: 'application/pdf',
            isUploaded: true,
            name: 'PDF 1',
            uri: 'testpdf.pdf',
            uriExpirationTime: this.getExpiryDate(true, 1),
            id: '1'
        } as Media$v1),
        new Media$v1({
            externalId: 'extId',
            contentType: 'application/pdf',
            contentLength: null,
            lastModifiedTime: null,
            name: 'PDF 2',
            fileName: 'lidar_0.glb',
            uri: '/assets/lidar_0.glb',
            uriExpirationTime: this.getExpiryDate(true, 2),
            id: '2'
        } as Media$v1),
        new Media$v1({
            contentType: 'image/jpeg',
            isUploaded: true,
            name: 'Image 1',
            uri: 'api/incidents/v1/attachments/1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a/dc4c6e7b-a9db-42c9-a70f-99d55be33fa0/image%202.jpg?sv=2019-07-07&sr=b&sig=FbHK5DSvpScYDZDEr5r1nJcFoSwU7ywVsdO8GjxWvWk%3D&se=2022-05-18T15%3A00%3A05Z&sp=r',
            uriExpirationTime: '2022-05-18 15:00:05',
            id: '3'
        } as Media$v1),

        // Videos work a bit differently now. 
        // You will need to add an attachment to something in localhost
        // Then copy the link address, remove everything before 'api/', and paste that here for the uri
        // These expire often, so you will have to repeat this process a lot when using Common-Lib Testbed
        new Media$v1({
            contentType: 'video/mp4',
            isUploaded: true,
            name: 'Video 1',
            uri: 'api/incidents/v1/attachments/1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a/5d2c5d0a-1977-42ef-af5e-e7dee02875e6/sample-mp4-filenew.mp4?sv=2019-07-07&sr=b&sig=ayZV7NOIyT7yznbrGfEBL6JjBf%2Fo8QZosXTNbm3iNbo%3D&se=2022-05-18T15%3A00%3A05Z&sp=r',
            uriExpirationTime: '2022-05-18 15:00:05',
            id: '5'
        } as Media$v1)
    ]

    currentId: number = 8;

    links: Hyperlink$v1[] = [
        {
            text: 'Staging Connect - kjhakjsdgjahgskjdhgasjkdhlsjdgklfjashfhagjkfhajdfh',
            href: 'https://staging.hxgnconnect.com'
        },
        {
            text: 'Dev Connect',
            href: 'https://dev.hxgnconnect.com'
        },
        {
            text: 'Local Connect',
            href: 'https://localhost.hxgnconnect.com'
        },
        {
            text: 'Sprint 61',
            href: 'https://dev.azure.com/hexagon-si-gpc/OTHERHEXPRODS.SCPSAS/_sprints/taskboard/Galileo/OTHERHEXPRODS.SCPSAS/Galileo%20Sprint%2061'
        },
        {
            text: 'Azure Pipelines',
            href: 'https://dev.azure.com/hexagon-si-gpc/OTHERHEXPRODS.SCPSAS/_build'
        }
    ]

    user: UserInfo$v1;

    /** Custom filter operation */
    filterOperationV2: FilterOperation$v2 = new FilterOperation$v2({
        property: 'title',
        type: FilterOperationType$v2.equals,
        operationString: '',
        inputType: FilterInputType$v2.dropdown,
        inputValues: [{ val: '1', display: 'Test' }]
    } as FilterOperation$v2);

    /** List of property options to filter on */
    propertyListV2: FilterProperty$v2[] = [
        {
            property: 'confirm',
            propertyToken: 'commonlibraries-main.component.confirm',
            placeHolderToken: 'commonlibraries-main.component.confirm',
            operation: this.filterOperationV2
        },
        {
            property: 'cancel',
            propertyToken: 'commonlibraries-main.component.cancel',
            placeHolderToken: 'commonlibraries-main.component.cancel',
            operation: this.filterOperationV2
        }
    ];

    constructor(
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private identityAdapter: CommonidentityAdapterService$v1,

    ) {
        // this.dialog.open(CommonConfirmDialogComponent, {
        //     data: {
        //         title: 'some title',
        //         msg: 'some message here',
        //         showWarningIcon: true,
        //         confirmBtnText: 'Yes'
        //     }
        // });
        this.localizationSrv.changeLanguageAsync('en');
    }

    ngOnInit() {
        setTimeout(() => {
            this.properties.set('update', 'test');
            this.properties = new Map(this.properties);
        }, 10000);

        this.array = [...Array(10000).keys()].map(i => i + 1);

        this.chunk = this.chunk.concat(this.array.slice(0, 100));
        this.lastIndex = 100;

        this.identityAdapter.getUserInfoAsync().then(user => {
            this.user = user;
        })

        setTimeout(() => {
            this.filename = 'updated file';
        }, 10000);
    }

    loadItems($event) {
        setTimeout(() => {
            this.chunk = this.chunk.concat(this.array.slice(this.lastIndex, this.lastIndex + $event));
            this.lastIndex = this.lastIndex + $event;
            if (this.lastIndex >= this.array.length) {
                this.loadComplete = true;
            }
        }, 5000);
    }

    log(logInfo: any) {
        if (logInfo) {
            console.log(logInfo)
        } else {
            console.log('yeeet')
        }
    }

    echo(obj: any = null) {
        console.info(obj);

        if (obj) {
            try {
                const input = new FormData();
                input.append('file', obj);

                const reader = new FileReader();
                reader.onload = (event: any) => {
                    console.info(obj.name, event.target.result);
                };
                reader.readAsText(obj);
            }
            catch { }
        }
    }

    openConfirm() {
        this.dialog.open(CommonConfirmDialogComponent, {
            data: {
                titleToken: 'shape-manager.component.confirmDiscardingChanges',
                msgToken: 'shape-manager.component.discardShapeChanges',
                msg: ' - Test MSG',
                msgInterpolateParams: [{
                    '{{shapeCount}}': '100'
                }]
            }
        }).afterOpened().subscribe(res => {
            setTimeout(() => {
                this.localizationSrv.changeLanguageAsync('ja');
            }, 5000);
        });
    }

    openUnsavedChanges() {
        this.dialog.open(CommonUnsavedChangesDialogComponent).afterClosed().subscribe(result => {
            console.log(result);
        })
    }

    openErrorDialog() {
        this.dialog.open(CommonErrorDialogComponent, {
            data: {
                title: 'Title Goes Here',
                message: 'Message goes here.'
            }
        });
    }

    toggleShowOpacityAndHex(event) {
        this.showOpacityAndHex = !this.showOpacityAndHex;
    }

    addFile(file: File) {
        this.echo(file);
        this.uploadingFile = file.name;
        this.files.push(file);
        this.uploadingFile = null;
    }

    updateLinks(links: Hyperlink$v1[]) {
        this.links = links;
        console.log(this.links);
    }

    updateRemarks(list: Remark$v1[]) {
        this.remarks = list;
        console.log(this.remarks);
    }

    postStyleUpdate(style: PostStyle$v1): void {
        console.debug('postStyleUpdate: ', {
            'style': style
        });
    }

    searchClicked(): void {
        console.debug('searchClicked');
    }

    private getExpiryDate(validDate: boolean, hours: number): string {
        const currentDate = new Date();

        if (validDate) {
            currentDate.setHours(currentDate.getHours() + hours);
        } else {
            currentDate.setHours(currentDate.getHours() - hours);
        }

        const dateString = currentDate.toUTCString();
        return dateString;
    }
}
