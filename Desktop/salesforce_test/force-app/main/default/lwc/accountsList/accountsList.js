import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountsListController.getAccounts';
import deleteAccounts from '@salesforce/apex/AccountsListController.deleteAccounts';
import getAccountsCount from '@salesforce/apex/AccountsListController.getAccountsCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class AccountsList extends LightningElement {
    // following properties are reactive, so UI updates automatically when they change
    @track accounts = [];
    // @track visibleAccounts = [];
    @track selectedRows = [];

    @track error;
    @track loading = false;


    // pagination properties
    currentPage = 1;
    totalPages = 1;
    totalRecords=0;    
    pageSize = 5;

    //sorting properties :
    //  sortedDirection = 'asc' or 'desc'
    // sortedBy = field name currently sorted
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
            this.totalRecords = await getAccountsCount();
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

            this.accounts = await getAccounts({ pageNumber: this.currentPage,
                pageSize: this.pageSize,
                sortBy: this.sortedBy,
                sortDirection: this.sortedDirection });
            // this.accounts = (data || []).map(account => ({
            //     ...account
            // }));
            console.log('Loaded accounts:', JSON.stringify(this.accounts));
            // this.totalPages = Math.max(1, Math.ceil(this.accounts.length / this.pageSize));
            // this.updateVisibleAccounts();
        } catch (e) {
            this.error = e?.body?.message || e?.message || 'An unknown error occurred';
            this.accounts = undefined;
        } finally {
            this.loading = false;
        }
    }

    // updateVisibleAccounts() {
    //     const start = (this.currentPage - 1) * this.pageSize;
    //     const end = start + this.pageSize;
    //     this.visibleAccounts = this.accounts.slice(start, end);
    // }

    // ----- Pagination -----
    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    async goToNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            // this.updateVisibleAccounts();
            await this.loadData();
        }
    }

    async goToPrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            // this.updateVisibleAccounts();
            await this.loadData();
        }
    }

    async goToFirst() {
        this.currentPage = 1;
        // this.updateVisibleAccounts();
        await this.loadData();
    }

    async goToLast() {
        this.currentPage = this.totalPages;
        // this.updateVisibleAccounts();
        await this.loadData();
    }

    async handleSort(event) {
        // retrieve the field name and sort direction (asc/desc) from the event
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
        this.currentPage = 1;

        // Copy the data
        // let sortedData = [...this.accounts];

        // Sort the data
        // sortedData.sort((a, b) => {
        //     {
        //         let valA = a[sortedBy] ? a[sortedBy].toString().toLowerCase() : '';
        //         let valB = b[sortedBy] ? b[sortedBy].toString().toLowerCase() : '';
        //         if (valA === valB) return 0;
        //         return sortDirection === 'asc'
        //             ? (valA > valB ? 1 : -1)
        //             : (valA < valB ? 1 : -1);
        //     }
        // });
        // this.accounts = sortedData;
        await this.loadData();
    }

    // Track checkbox selections
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }
    async handleDelete() {
        if (this.selectedRows.length === 0) {
            this.showToast('No records selected', 'Please select at least one record.', 'warning');
            return;
        }

        const idsToDelete = this.selectedRows.map(row => row.Id);

        this.loading = true;
        try {
            await deleteAccounts({ accountIds: idsToDelete });
            this.showToast('Deleted!', 'Selected records have been deleted.', 'success');
            this.selectedRows = [];
            await this.loadData();
        } catch (e) {
            console.error('Error deleting accounts:', JSON.stringify(e));
            this.showToast('Error', e?.body?.message || e?.message || 'Delete failed.', 'error');
        } finally {
            this.loading = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
