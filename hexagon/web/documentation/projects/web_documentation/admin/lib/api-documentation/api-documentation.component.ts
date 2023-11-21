import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Audience$v1, Documentation$v1, TranslationGroup } from '@galileo/web_documentation/_common';
import { DataService } from '@galileo/web_documentation/_core';
import { saveAs } from 'file-saver';
import { MarkdownService } from 'ngx-markdown';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApiDocumentationTranslatedTokens, ApiDocumentationTranslationTokens } from './api-documentation.translation';

@Component({
    templateUrl: 'api-documentation.component.html',
    styleUrls: ['api-documentation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiDocumentationComponent implements OnInit, OnDestroy {

    /** Expose audiences to html. */
    readonly audiences: typeof Audience$v1 = Audience$v1;

    /** List of filtered docs */
    filteredDocs: Documentation$v1[] = [];

    /** String used to search documentation. */
    searchString = '';

    /** Tracks selected documentation document. */
    selectedDoc: Documentation$v1 | null = null;

    /** Tracks when the scroll button should be shown. */
    showScrollBtn = false;

    /** Tracks markdown loading state. */
    private readonly isMarkdownLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    /** Observable for is markdown loading. */
    readonly isMarkdownLoading$: Observable<boolean> = this.isMarkdownLoading.asObservable();

    /** Tracks initial page load. */
    private readonly isPageLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    /** Observable for is page loading. */
    readonly isPageLoading$: Observable<boolean> = this.isPageLoading.asObservable();

    /** Tracks markdown url for selected documentation document. */
    private readonly markdownURL: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Observable for markdown url. */
    readonly markdownURL$: Observable<string> = this.markdownURL.asObservable();

    /** Expose translation tokens to html. */
    readonly tokens: typeof ApiDocumentationTranslationTokens = ApiDocumentationTranslationTokens;

    /** List of translated tokens. */
    readonly tTokens: ApiDocumentationTranslatedTokens = {} as ApiDocumentationTranslatedTokens;

    /** Docs store. */
    private docs: Documentation$v1[] = [];

    /** Map for documentation keywords translations. */
    private readonly docKeywords: Map<string, string[]> = new Map<string, string[]>();

    /** Map for documentation translations. */
    private readonly docNames: Map<string, string> = new Map<string, string>();

    /** List of scripts to be loaded in. */
    private readonly scripts: string[] = [
        'assets/documentation-core/scripts/marked.min.js',
        'assets/documentation-core/scripts/prism.min.js',
        'assets/documentation-core/scripts/prism-components/prism-clike.min.js',
        'assets/documentation-core/scripts/prism-components/prism-csharp.min.js',
        'assets/documentation-core/scripts/prism-components/prism-css.min.js',
        'assets/documentation-core/scripts/prism-components/prism-javascript.min.js',
        'assets/documentation-core/scripts/prism-components/prism-json.min.js',
        'assets/documentation-core/scripts/prism-components/prism-markup.min.js',
        'assets/documentation-core/scripts/prism-components/prism-powershell.min.js',
        'assets/documentation-core/scripts/prism-components/prism-scss.min.js',
        'assets/documentation-core/scripts/prism-components/prism-typescript.min.js',
        'assets/documentation-core/scripts/prism-components/prism-xml-doc.min.js'
    ];

    /** List of styles to be loaded in. */
    private readonly styles: string[] = [
        'assets/documentation-core/themes/vscode-dark.css',
        'assets/documentation-core/themes/markdown.css'
    ];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private markdownSrv: MarkdownService,
        private sanitizer: DomSanitizer,
        private title: Title
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initLocalizationAsync();

        this.loadStyles();
        this.loadScripts();

        await this.initDocNamesAsync();
        this.initDocDescriptionsAsync();
        this.initDocKeywordsAsync();

        this.markdownSrv.renderer.link = (href: string, title: string, text: string) => {
            if (href.includes('http')) {
                return `<a href="${href}" target="_blank">${text}</a>`;
            } else {
                const newHref: string = window.location.pathname + href;
                return `<a href="${newHref}">${text}</a>`;
            }
        };

        this.markdownSrv.renderer.heading = (text: string, level: number) => {
            const doubleQuotes = '&quot;';
            const emptyString = '';
            const lessThan = '&lt;';
            const greaterThan = '&gt;';
            const singleQuote = '&#39;';

            // Strips out "?", "/", "<", and ">" characters
            let escapedText: string = text.replace(/[?/<>]/g, emptyString);

            // Strips out all instances of double quotes (" - &quot;)
            while (escapedText.includes(doubleQuotes)) {
                escapedText = escapedText.replace(doubleQuotes, emptyString);
            }

            // Strips out all instances of single quotes (' - &#39;)
            while (escapedText.includes(singleQuote)) {
                escapedText = escapedText.replace(singleQuote, emptyString);
            }

            // Strips out all instances of less than (< - &lt;)
            while (escapedText.includes(lessThan)) {
                escapedText = escapedText.replace(lessThan, emptyString);
            }

            // Strips out all instances of greater than (> - &gt;)
            while (escapedText.includes(greaterThan)) {
                escapedText = escapedText.replace(greaterThan, emptyString);
            }

            // Replaces spaces with "-"
            escapedText = escapedText.toLowerCase().replace(/[^\w]+/g, '-');

            return `<h${level} id="${escapedText}">${text}</h${level}>`;
        };

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            this.initLocalizationAsync();
            await this.initDocNamesAsync();
            this.initDocDescriptionsAsync();
            this.initDocKeywordsAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Clears search box text.
     */
    clearText(): void {
        this.searchString = '';
        this.search();
    }

    /**
     * Closes markdown view to return to all docs view
     */
    closeMarkdown(): void {
        this.showScrollBtn = false;
        this.selectedDoc = null;
        this.markdownURL.next('');
        if (location.hash) {
            location.hash = '';
        }
    }

    /**
     * Opens code samples for given documentation document
     * @param doc Document to get code samples for
     * @param $event Mouse event to stop propagation in square
     */
    async openCodeSamplesAsync(doc: Documentation$v1, $event?: MouseEvent): Promise<void> {
        if ($event) {
            $event.stopPropagation();
        }

        const codeSamplesURL: string = await this.dataSrv.getCodeSample$(doc.id, doc.codeSampleId!).toPromise();
        saveAs(codeSamplesURL, doc.codeSampleFileName);
    }

    /**
     * Opens markdown for selected documentation document
     * @param doc Documentation document to select
     */
    async openMarkdownAsync(doc: Documentation$v1): Promise<void> {
        this.isMarkdownLoading.next(true);
        this.selectedDoc = doc;
        const markdownURL: string = await this.dataSrv.getMarkdown$(this.selectedDoc.id, this.selectedDoc.markdownId!).toPromise();
        const sanitizedURL: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(markdownURL);
        this.markdownURL.next(this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, sanitizedURL)!);
        this.isMarkdownLoading.next(false);
    }

    /**
     * Opens swagger page in new tab
     * @param doc Doc to open
     * @param $event Mouse event to stop propagation in square
     */
    openSwaggerPage(doc: Documentation$v1, $event?: MouseEvent): void {
        if ($event) {
            $event.stopPropagation();
        }

        let link = '/' + doc.url;
        const hostname: string = window.location.hostname;

        if (hostname.includes('localhost')) {
            link = 'http://localhost:' + doc.port + '/' + doc.url;
        }

        window.open(link, '_blank');
    }

    /**
     * Shows scroll button once page has been scrolled
     * @param $event Scroll event
     */
    onScroll($event: any): void {
        this.showScrollBtn = $event.target.scrollTop !== 0;
    }

    /**
     * Searches documentation by user input
     */
    search(): void {
        if (this.searchString.length) {
            const searchString: string = this.searchString.toLowerCase();
            this.filteredDocs = this.docs.filter((doc: Documentation$v1) => {
                return this.docNames.get(doc.id)?.includes(searchString) ||
                    this.docKeywords.get(doc.id)?.some(x => x.includes(searchString));
            });
        } else {
            this.filteredDocs = [...this.docs];
        }
    }

    /**
     * Track by function
     * @param index Index of item in array
     * @param item Documentation item
     * @returns item id
     */
    trackByFn(index: number, item: Documentation$v1): string {
        return item.id;
    }

    /**
     * Initializes the translated doc descriptions..
     */
    private async initDocDescriptionsAsync(): Promise<void> {
        const docTokens: string[] = this.docs.map(x => x.descriptionToken!);
        await this.localizationSrv.localizeStringsAsync(docTokens);
    }

    /**
     * Initializes the translated doc names map for searching.
     */
    private async initDocNamesAsync(): Promise<void> {
        const docs: Documentation$v1[] = await this.dataSrv.getAll$().toPromise();
        const docTokens: string[] = docs.map(x => x.nameToken!);
        await this.localizationSrv.localizeStringsAsync(docTokens);
        const translations = await this.localizationSrv.getTranslationAsync(docTokens);

        this.docs = docs.sort((a, b) => translations[a.nameToken!].localeCompare(translations[b.nameToken!]));
        this.docs.forEach((doc: Documentation$v1) => {
            this.docNames.set(doc.id, translations[doc.nameToken!].toLowerCase());
        });

        this.filteredDocs = [...this.docs];
    }

    /**
     * Initializes the translated doc keywords map for searching.
     */
    private async initDocKeywordsAsync(): Promise<void> {
        let keywordTokens: string[] = [];
        this.docs.forEach((doc: Documentation$v1) => {
            keywordTokens = keywordTokens.concat(doc.keywords!);
        });

        await this.localizationSrv.localizeStringsAsync(keywordTokens);
        const translations = await this.localizationSrv.getTranslationAsync(keywordTokens);

        this.docs.forEach((doc: Documentation$v1) => {
            const keywordTranslations: string[] = [];
            doc.keywords!.forEach((keyword: string) => {
                keywordTranslations.push(translations[keyword].toLowerCase());
            });

            this.docKeywords.set(doc.id, keywordTranslations);
        });

        this.isPageLoading.next(false);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.admin,
            TranslationGroup.core
        ]);
        this.title.setTitle('HxGN Connect');

        this.tTokens.searchDocumentation = '';

        const translatedTokens = await this.localizationSrv.getTranslationAsync(Object.values(ApiDocumentationTranslationTokens));
        this.tTokens.apiDocumentation = translatedTokens[ApiDocumentationTranslationTokens.apiDocumentation];
        this.tTokens.searchDocumentation = translatedTokens[ApiDocumentationTranslationTokens.searchDocumentation];

        this.title.setTitle('HxGN Connect - ' + this.tTokens.apiDocumentation);
    }

    /**
     * Loads scripts in to body.
     */
    private loadScripts(): void {
        const body: HTMLElement = document.body;
        const scriptElements: HTMLScriptElement[] = [];

        this.scripts.forEach((script: string) => {
            const scriptElement = document.createElement('script');
            scriptElement.src = script;
            scriptElement.async = false;
            scriptElement.defer = false;
            scriptElements.push(scriptElement);
            body.appendChild(scriptElement);
        });
    }

    /**
     * Loads style sheet in to document head.
     */
    private loadStyles(): void {
        const head: HTMLElement = document.getElementsByTagName('head')[0];
        const links: HTMLLinkElement[] = [];

        this.styles.forEach((style: string, index: number) => {
            links[index] = document.createElement('link');
            links[index].href = style;
            links[index].media = 'all';
            links[index].rel = 'stylesheet';
            links[index].type = 'text/css';

            head.appendChild(links[index]);
        });
    }
}
