import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Batch } from '../abstractions/batch';
import { Ink } from '../abstractions/ink';
import { Item } from '../abstractions/item';
import { Operator } from '../abstractions/operator';
import { Press } from '../abstractions/press';

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    /** List of batches loaded from the database */
    private batches = new BehaviorSubject<Batch[]>([]);

    /** List of batches loaded from the database */
    batches$ = this.batches.asObservable();

    /** List of presses loaded from the database */
    private presses = new BehaviorSubject<Press[]>([]);

    /** List of presses loaded from the database */
    presses$ = this.presses.asObservable();

    /** List of inks loaded from the database */
    private inks = new BehaviorSubject<Ink[]>([]);

    /** List of inks loaded from the database */
    inks$ = this.inks.asObservable();

    /** List of operators loaded from the database */
    private operators = new BehaviorSubject<Operator[]>([]);

    /** List of operators loaded from the database */
    operators$ = this.operators.asObservable();

    /** List of items loaded from the database */
    private items = new BehaviorSubject<Item[]>([]);

    /** List of items loaded from the database */
    items$ = this.items.asObservable();

    /** Supabase client */
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
        this.getAllPresses();
        this.getAllInks();
        this.getAllOperators();
        this.getAllItems();
        this.getAllBatches();
    }

    /**
     * Add a new batch to the table
     * @param batch Batch to insert to table
     */
    async createBatch(batch: Batch): Promise<void> {
        batch.createddate = new Date();

        await this.supabase.from('batches').insert([this.createBatchObject(batch)]);
        this.getAllBatches();
    }

    /**
     * Add a new press to the table
     * @param press Press to insert to table
     */
    async createPress(press: Press): Promise<void> {
        await this.supabase.from('presses').insert([this.createPressObject(press)]);
        this.getAllPresses();
    }

    /**
     * Add a new ink to the table
     * @param ink Ink to insert to table
     */
    async createInk(ink: Ink): Promise<void> {
        await this.supabase.from('inks').insert([this.createInkObject(ink)]);
        this.getAllInks();
    }

    /**
     * Add a new operator to the table
     * @param operator Operator to insert to table
     */
    async createOperator(operator: Operator): Promise<void> {
        await this.supabase.from('operators').insert([this.createOperatorObject(operator)]);
        this.getAllOperators();
    }

    /**
     * Add a new item to the table
     * @param item Item to insert to table
     */
    async createItem(item: Item): Promise<void> {
        await this.supabase.from('items').insert([this.createItemObject(item)]);
        this.getAllItems();
    }

    /**
     * Returns a batch loaded from the database
     * @param id Id of the batch
     * @returns Found batch in the loaded list
     */
    async readBatch(id: number): Promise<Batch> {
        return new Promise(async (resolve) => {
            if (!this.batches.getValue().length) {
                await this.getAllBatches();
            }

            resolve(this.batches.getValue().find((batch) => batch.id === id));
        });
    }

    /**
     * Updates a row in the table
     * @param batch Updated batch object
     */
    async updateBatch(batch: Batch, recordAction = true, completed = false): Promise<void> {
        if (this.objectsAreDifferent(await this.readBatch(batch.id), batch)) {
            batch.lastediteddate = new Date();

            await this.supabase.from('batches').update(this.createBatchObject(batch)).eq('id', batch.id);
            this.getAllBatches();

            if (!recordAction) {
                return;
            }
        }
    }

    /**
     * Deletes a row from the table
     * @param id Identifier of the batch to delete
     */
    async deleteBatch(id: number): Promise<void> {
        await this.supabase.from('batches').delete().eq('id', id);
        this.getAllBatches();
    }

    /**
     * Deletes a row from the table
     * @param id Identifier of the press to delete
     */
    async deletePress(id: number): Promise<void> {
        await this.supabase.from('presses').delete().eq('id', id);
        this.getAllPresses();
    }

    /**
     * Deletes a row from the table
     * @param id Identifier of the ink to delete
     */
    async deleteInk(id: number): Promise<void> {
        await this.supabase.from('inks').delete().eq('id', id);
        this.getAllInks();
    }

    /**
     * Deletes a row from the table
     * @param id Identifier of the operator to delete
     */
    async deleteOperator(id: number): Promise<void> {
        await this.supabase.from('operators').delete().eq('id', id);
        this.getAllOperators();
    }

    /**
     * Deletes a row from the table
     * @param id Identifier of the item to delete
     */
    async deleteItem(id: number): Promise<void> {
        await this.supabase.from('items').delete().eq('id', id);
        this.getAllItems();
    }

    /**
     * Creates a new copy removing pass by reference
     * @param data Object data to copy
     * @returns New copy of the object
     */
    copyObject(data: any): any {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * Gets the list of batches to the table
     */
    private async getAllBatches(): Promise<void> {
        const batches = (await this.supabase.from('batches').select('*')).data.map((batch) => Batch.create(batch));

        if (this.objectsAreDifferent(this.batches.getValue(), batches)) {
            this.batches.next(batches);
        }
    }

    /**
     * Gets the list of presses to the table
     */
    private async getAllPresses(): Promise<void> {
        const presses = (await this.supabase.from('presses').select('*')).data.map((press) => Press.create(press));

        if (this.objectsAreDifferent(this.presses.getValue(), presses)) {
            this.presses.next(presses);
        }
    }

    /**
     * Gets the list of inks to the table
     */
    private async getAllInks(): Promise<void> {
        const inks = (await this.supabase.from('inks').select('*')).data.map((ink) => Ink.create(ink));

        if (this.objectsAreDifferent(this.inks.getValue(), inks)) {
            this.inks.next(inks);
        }
    }

    /**
     * Gets the list of operators to the table
     */
    private async getAllOperators(): Promise<void> {
        const operators = (await this.supabase.from('operators').select('*')).data.map((operator) => Operator.create(operator));

        if (this.objectsAreDifferent(this.operators.getValue(), operators)) {
            this.operators.next(operators);
        }
    }

    /**
     * Gets the list of items to the table
     */
    private async getAllItems(): Promise<void> {
        const items = (await this.supabase.from('items').select('*')).data.map((item) => Item.create(item));

        if (this.objectsAreDifferent(this.items.getValue(), items)) {
            this.items.next(items);
        }
    }

    /**
     * Compares two objects using JSON stringify and parse
     * @param one Expected object
     * @param two Actual object
     * @returns Objects are different
     */
    private objectsAreDifferent(one: any, two: any): boolean {
        return this.copyObject(one) !== this.copyObject(two);
    }

    /**
     * Turns a batch data into API friendly object
     * @param batch Batch to turn into object
     * @returns Object to send to API
     */
    private createBatchObject(batch: Batch): object {
        return {
            itemid: batch.itemid,
            type: batch.type,
            urgency: batch.urgency,
            createddate: batch.createddate,
            lastediteddate: new Date(),
            scheduleddate: batch.scheduleddate,
            paperweight: batch.paperweight,
            description: batch.description,
            comments: batch.comments,
            numberpersheet: batch.numberpersheet,
            parentsheet: batch.parentsheet,
            finishedsheetsize: batch.finishedsheetsize,
            paperpackaging: batch.paperpackaging,
            pressoperator: batch.pressoperator,
            completeddate: batch.completeddate,
            runbydate: batch.runbydate,
            shipdate: batch.shipdate,
            quantityrequested: batch.quantityrequested,
            quantityprinted: batch.quantityprinted,
            pressid: batch.pressid,
            iscompleted: batch.iscompleted,
            ink1name: batch.ink1name,
            ink1quantity: batch.ink1quantity,
            ink2name: batch.ink2name,
            ink2quantity: batch.ink2quantity,
            ink3name: batch.ink3name,
            ink3quantity: batch.ink3quantity,
            ink4name: batch.ink4name,
            ink4quantity: batch.ink4quantity,
        };
    }

    /**
     * Turns a press data into API friendly object
     * @param press Press to turn into object
     * @returns Object to send to API
     */
    private createPressObject(press: Press): object {
        return {
            name: press.name,
        };
    }

    /**
     * Turns a ink data into API friendly object
     * @param ink Operator to turn into object
     * @returns Object to send to API
     */
    private createInkObject(ink: Operator): object {
        return {
            name: ink.name,
        };
    }

    /**
     * Turns a operator data into API friendly object
     * @param operator Operator to turn into object
     * @returns Object to send to API
     */
    private createOperatorObject(operator: Operator): object {
        return {
            name: operator.name,
        };
    }

    /**
     * Turns a item data into API friendly object
     * @param item Item to turn into object
     * @returns Object to send to API
     */
    private createItemObject(item: Item): object {
        return {
            name: item.name,
        };
    }
}
