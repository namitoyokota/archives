import { Component } from '@angular/core';
import { NgxCSVParserError, NgxCsvParser } from 'ngx-csv-parser';
import { stringSimilarity } from 'string-similarity-js';

interface Transaction {
    Amount: number;
    Date: string;
    Description: string;
    Time: string;
    Type: string;
}

interface TransactionGroup {
    name: string;
    transactions: Transaction[];
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    transactionGroups: TransactionGroup[] = [];

    displayedColumns = ['Date', 'Amount', 'Type', 'Description'];

    constructor(private ngxCsvParser: NgxCsvParser) {}

    onFileInput(files: FileList | null): void {
        if (files) {
            this.ngxCsvParser
                .parse(files[0], { header: true, delimiter: ',', encoding: 'utf8' })
                .pipe()
                .subscribe({
                    next: (result): void => {
                        const transactions = result as Transaction[];
                        transactions.forEach((transaction) => {
                            const existingGroup = this.transactionGroups.find(
                                (group) => stringSimilarity(group.name, transaction.Description) > 0.75,
                            );
                            if (existingGroup) {
                                existingGroup.transactions.push(transaction);
                            } else {
                                const newGroup = { name: transaction.Description, transactions: [transaction] } as TransactionGroup;
                                this.transactionGroups.push(newGroup);
                            }
                        });

                        this.transactionGroups = this.transactionGroups.sort((a, b) => {
                            if (a.transactions.length === b.transactions.length) {
                                return a.name > b.name ? 1 : -1;
                            } else {
                                return a.transactions.length > b.transactions.length ? -1 : 1;
                            }
                        });
                    },
                    error: (error: NgxCSVParserError): void => {
                        console.log('Error', error);
                    },
                });
        }
    }

    calculateTotal(transactions: Transaction[]): number {
        return transactions.reduce((sum, current) => sum + +current.Amount, 0);
    }

    calculateAverage(transactions: Transaction[]): number {
        return this.calculateTotal(transactions) / transactions.length;
    }
}
