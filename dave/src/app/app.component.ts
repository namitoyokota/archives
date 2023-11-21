import { Component } from '@angular/core';
import { Budget } from './abstractions/budget';
import { Expense } from './abstractions/expense';
import { GoogleSheetsService } from './services/google-sheets.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    /** List of expenses in the database */
    expenses: Expense[] = [];

    /** List of filtered expenses */
    filteredExpenses: Expense[] = [];

    /** List of budgets */
    budgets: Budget[] = [];

    /** List of existing categories */
    categories: string[] = [];

    /** List of categories to filter from */
    activeFilters: string[] = [];

    /** Flag to indicate whether to display search input */
    displaySearch = false;

    /** Flag to indicate whether to filter pane */
    displayFilter = false;

    /** Flag to indicate whether to months selector */
    displayMonths = false;

    /** String to search expenses by */
    searchString = '';

    /** Total expense by category */
    categoryTotals: Map<string, number> = new Map<string, number>();

    /** Total amount of money spent */
    totalExpense: number = 0;

    /** Months of the year */
    readonly months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    /** Currently displayed month */
    activeMonth = this.months[new Date().getMonth()];

    constructor(private sheetService: GoogleSheetsService) {
        this.getBudgets();
        this.getExpenses();
    }

    /** Checks if the provided category has a set budget */
    hasBudget(category: string): boolean {
        return this.budgets.some((budget) => budget.category === category);
    }

    /** Returns budget value for provided category */
    getBudget(category: string): string {
        const budget = this.budgets.find((budget) => budget.category === category);
        if (budget) {
            return budget.budget;
        } else {
            return '';
        }
    }

    /** Turns number into dollars */
    formatCost(cost: number): string {
        return cost.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    /** Checks if the filter is on for a category */
    isActiveFilter(category: string): boolean {
        return this.activeFilters.includes(category);
    }

    /** Returns true if no active filters are selected */
    isFilterEmpty(): boolean {
        return this.activeFilters.length === 0;
    }

    /** Toggle on or off category filter */
    toggleFilter(category: string): void {
        if (this.isActiveFilter(category)) {
            this.activeFilters = this.activeFilters.filter((c) => c !== category);
        } else {
            this.activeFilters = [...this.activeFilters, category];
        }

        this.filterExpenses();
    }

    /** Remove all active filters */
    clearFilter(): void {
        this.activeFilters = [];
        this.filterExpenses();
    }

    /** Add all filters back */
    disableFilter(): void {
        this.activeFilters = this.categories;
        this.filterExpenses();
    }

    /** Switch on or off toggle for search pane */
    toggleSearchMode(): void {
        this.displaySearch = !this.displaySearch;
    }

    /** Switch on or off toggle for filter pane */
    toggleFilterMode(): void {
        this.displayFilter = !this.displayFilter;
    }

    /** Switch on or off toggle for month pane */
    toggleMonthsMode(): void {
        this.displayMonths = !this.displayMonths;
    }

    /** Update search filter */
    updateSearch(): void {
        this.filterExpenses();
    }

    /** Checks if given month is currently selected */
    isActiveMonth(month: string): boolean {
        return this.activeMonth === month;
    }

    /** Updates currently displayed month */
    switchMonth(month: string): void {
        this.activeMonth = month;
        this.getExpenses();
    }

    /** Gets budgets from the table */
    private getBudgets(): void {
        this.sheetService.getBudgets().then((budgets) => {
            this.budgets = budgets;
        });
    }

    /** Gets currently active month expenses from the table */
    private getExpenses(): void {
        this.sheetService.getExpenses(this.activeMonth).then((expenses) => {
            this.expenses = expenses;

            this.generateCategories();
            this.filterExpenses();

            this.calculateCategoryTotals();
            this.calculateTotalExpense();
        });
    }

    /** Filter out all expenses by active category */
    private filterExpenses(): void {
        this.filterByCategory();
        this.filterBySearch();

        this.calculateTotalExpense();
    }

    /** Filter out expense list by category */
    private filterByCategory(): void {
        this.filteredExpenses = this.expenses.filter((expense: Expense) => {
            return this.isActiveFilter(expense.category);
        });
    }

    /** Filter out expense by search */
    private filterBySearch(): void {
        this.filteredExpenses = this.filteredExpenses.filter((expense: Expense) => {
            const company = expense.company.toLowerCase().includes(this.searchString.toLowerCase());
            const description = expense.description.toLowerCase().includes(this.searchString.toLowerCase());

            return company || description;
        });
    }

    /** Create a list of unique categories */
    private generateCategories(): void {
        this.categories = [...new Set(this.expenses.map((e) => e.category))];

        this.activeFilters = this.categories;
    }

    /** Adds up all expenses by category */
    private calculateCategoryTotals(): void {
        this.expenses.forEach((expense: Expense) => {
            const currentTotal = this.categoryTotals.get(expense.category);
            if (currentTotal) {
                this.categoryTotals.set(expense.category, currentTotal + this.parseCost(expense));
            } else {
                this.categoryTotals.set(expense.category, this.parseCost(expense));
            }
        });
    }

    /** Adds up all expenses */
    private calculateTotalExpense(): void {
        this.totalExpense = 0;

        this.filteredExpenses.forEach((expense: Expense) => {
            this.totalExpense += this.parseCost(expense);
        });
    }

    /** Parses cost from string into number */
    private parseCost(expense: Expense): number {
        const value = +expense.cost.replace('$', '').replace(',', '');

        if (value && expense.type === 'Withdrawal') {
            return -value;
        } else if (value && expense.type === 'Deposit') {
            return value;
        } else {
            return 0;
        }
    }
}
