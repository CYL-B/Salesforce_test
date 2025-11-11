import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountsListController.getAccounts';

export default class AccountsList extends LightningElement {
    // following properties are reactive, so UI updates automatically when they change
    @track accounts;
    @track visibleAccounts =[];

    @track error;
    @track loading = false;


    // pagination properties
    currentPage = 1;
    totalPages = 1;
    limitSize = 50;
    pageSize = 5;

    //sorting properties
    sortedDirection = 'asc';
    sortedBy;

// sortable : makes columns clickable for sorting
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
        { label: 'Industry', fieldName: 'Industry', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'Type', type: 'text', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true }
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
            this.totalPages =  Math.max(1, Math.ceil(this.accounts.length / this.pageSize));
            this.updateVisibleAccounts();
        } catch (e) {
            this.error = e?.body?.message || e?.message || 'An unknown error occurred';
            this.accounts = undefined;
        } finally {
            this.loading = false;
        }
    }

    updateVisibleAccounts() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.visibleAccounts= this.accounts.slice(start, end);
    }

    // ----- Pagination -----
    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    goToNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.updateVisibleAccounts();
        }
    }

    goToPrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.updateVisibleAccounts();
        }
    }

    goToFirst() {
        this.currentPage = 1;
        this.updateVisibleAccounts();
    }

    goToLast() {
        this.currentPage = this.totalPages;
        this.updateVisibleAccounts();
    }

    handleSort(event) {
        // retrieve the field name and sort direction (asc/desc) from the event
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
