import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountsListController.getAccounts';

export default class AccountsList extends LightningElement {
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

    connectedCallback() {
        this.loadData();
    }

    handleLimitChange(event) {
        const val = parseInt(event.detail.value, 10);
        this.limitSize = isNaN(val) || val <= 0 ? 10 : val;
        this.loadData();
    }

    async loadData() {
        this.loading = true;
        this.error = undefined;
        try {
            const data = await getAccounts({ limitSize: this.limitSize });
            this.accounts = data;
        } catch (e) {
            this.error = e?.body?.message || e?.message || 'An unknown error occurred';
            this.accounts = undefined;
        } finally {
            this.loading = false;
        }
    }
}
