import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountsListController.getAccounts';

export default class AccountsList extends LightningElement {
    // following properties are reactive, so UI updates automatically when they change
    @track accounts;
    @track error;
    @track loading = false;

    limitSize = 10;
// sortable :makes columns clickable for sorting
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
        { label: 'Industry', fieldName: 'Industry', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'Type', type: 'text', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
        { label: 'Website', fieldName: 'Website', type: 'url', sortable: true }
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

    handleSort(event) {
        // retrieve the field name and sort direction from the event
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;

         // Copy the data
        let sortedData = [...this.accounts];
        
        // Sort the data
        sortedData.sort((a, b) => {{
            let valA = a[sortedBy] ? a[sortedBy].toString().toLowerCase() : '';
            let valB = b[sortedBy] ? b[sortedBy].toString().toLowerCase() : '';
            if (valA === valB) return 0;
            return sortDirection === 'asc'
                ? (valA > valB ? 1 : -1)
                : (valA < valB ? 1 : -1);
        }});
         this.accounts = sortedData;
    }

}
