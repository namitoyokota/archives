/*
 * Still exploring a more dynamic way to generate these keywords via a posible custom decorator? For now we just have to be mindful of
 * adding/editing the necessary keywords as routes change. This list is basically keywords within a route that have a dedicated
 * layoutviewmodel propery set. DWHITTEN 09/21/2021
 */
let appLayoutKeywords = [
    'pdf',
    'embedded',
    'versight-dashboard-report',
    'download-report',
    'task-report',
    'active-workflow-report-body',
    'active-workflow-report-header',
    'active-workflow-report-footer',
    'aws-registration',
    'cyberAnalysis',
    'csrAnalysisEn',
    'csrAnalysisEnView',
    'csrAnalysisSd',
    'csrAnalysisSdView',
    'csaAnalysisEn',
    'csaAnalysisEnView',
    'csaAnalysisSd',
    'csaAnalysisSdView',
    'bcpAnalysis',
    'bcpAnalysisEn',
    'bcpAnalysisEnView',
    'bcpAnalysisSd',
    'bcpAnalysisSdView',
    'bcaAnalysis',
    'bcaAnalysisEn',
    'bcaAnalysisEnView',
    'bcaAnalysisSd',
    'bcaAnalysisSdView',
    'socAnalysis',
    'socAnalysisEn',
    'socAnalysisSd',
    'socAnalysisSdView',
    'socAnalysisEnView',
    'documentStorageView',
    'financialAnalysis',
    'financialAnalysisEnView',
    'socStandardPDFHeader',
    'enterprisePDFHeader',
    'standardPDFHeader',
    'enterprisePDFFooter',
    'standardPDFFooter'
];

function routeHasLayoutViewModel(urlFragment: string): boolean {
    let foundLayout = false;

    for (let keyword of appLayoutKeywords) {
        if (urlFragment.indexOf(keyword)>=0) {
            foundLayout = true;
            break;
        }
    }

    return foundLayout;
}

export { routeHasLayoutViewModel }