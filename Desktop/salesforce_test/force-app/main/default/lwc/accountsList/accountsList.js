import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountsListController.getAccounts';

export default class AccountsList extends LightningElement {
    // following properties are reactive, so UI updates automatically when they change
    @track accounts;
    @track error;
    @track loading = false;

    limitSize = 10;

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Industry', fieldName: 'Industry', type: 'text' },
        { label: 'Type', fieldName: 'Type', type: 'text' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Website', fieldName: 'Website', type: 'url' }
    ];
// lifecycle hook called when component is inserted into the DOM, used here to load initial data
    connectedCallback() {
        this.loadData();
    }
    async loadData() {
        this.loading = true;
        this.error = undefined;
        try {
            const data = await getAccounts({ limitSize: this.limitSize });
            this.accounts = (data || []).map(account => ({
                ...account 
            }));
        } catch (e) {
            this.error = e?.body?.message || e?.message || 'An unknown error occurred';
            this.accounts = undefined;
        } finally {
            this.loading = false;
        }
    }
}
