import { Injectable } from '@angular/core';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { Budget } from '../abstractions/budget';
import { BudgetMap } from '../abstractions/budget.map';
import { Expense } from '../abstractions/expense';
import { ExpenseMap } from '../abstractions/expense-map';

@Injectable({
    providedIn: 'root',
})
export class GoogleSheetsService {
    /** ID from the google sheets URL */
    private readonly SPREADSHEET_ID = '12RnidOkxSYty8tn-nq9DfgrdDL7Fklf6VVvOogn9dnc';

    /** Name of the sheet to read */
    private readonly SPREADSHEET_NAME = 'February';

    /** Name of the sheet to read budgets */
    private readonly BUDGET_SPREADSHEET = 'Budgets';

    constructor(private googleSheetsDbService: GoogleSheetsDbService) {}

    /** Call Google Sheets Service to get expenses */
    async getExpenses(spreadsheetName: string): Promise<Expense[]> {
        return new Promise((resolve) => {
            this.googleSheetsDbService
                .get<Expense>(this.SPREADSHEET_ID, spreadsheetName, ExpenseMap)
                .toPromise()
                .then((expenses) => {
                    if (expenses) {
                        resolve(expenses);
                    } else {
                        resolve([]);
                    }
                })
                .catch((error: unknown) => {
                    console.error(error);
                    resolve([]);
                });
        });
    }

    /** Call Google Sheets Service to get budgets */
    async getBudgets(): Promise<Budget[]> {
        return new Promise((resolve) => {
            this.googleSheetsDbService.get<Budget>(this.SPREADSHEET_ID, this.BUDGET_SPREADSHEET, BudgetMap).subscribe((budgets) => {
                resolve(budgets);
            });
        });
    }
}
