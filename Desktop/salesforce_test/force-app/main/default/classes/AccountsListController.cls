public with sharing class AccountsListController {
    public class AccountRow { 
        @AuraEnabled public Id Id { get; set; } 
        @AuraEnabled public String Name { get; set; } 
        @AuraEnabled public String Type { get; set; } 
        @AuraEnabled public String Industry { get; set; } 
        @AuraEnabled public String Phone { get; set; } }

    @AuraEnabled(cacheable=true)
    public static List<AccountRow> getAccounts(Integer pageSize, Integer pageNumber, String sortBy, String sortDirection) {
        Integer limitRows = (pageSize == null || pageSize <= 0) ? 5 : pageSize;
        Integer offsetRows = ((pageNumber == null || pageNumber <= 1) ? 0 : (pageNumber - 1) * limitRows);
        sortBy = (sortBy == null || sortBy == '') ? 'Name' : sortBy;
        sortDirection = (sortDirection != null && sortDirection.toUpperCase() == 'DESC') ? 'DESC' : 'ASC';
        //dynamic SOQL query
        String query = 'SELECT Id, Name, Type, Industry, Phone FROM Account ORDER BY ' + sortBy + ' ' + sortDirection + ' LIMIT :limitRows OFFSET :offsetRows';
        List<Account> accounts = Database.query(query);


        List<AccountRow> results = new List<AccountRow>();
        // try {
        //     for (Account a : [ 
        //         SELECT Id, Name, Type, Industry, Phone, Website 
        //         FROM Account 
        //         ORDER BY Name 
        //         LIMIT :limitRows ]) { 
        //             AccountRow row = new AccountRow(); 
        //             row.Id = a.Id; 
        //             row.Name = a.Name; 
        //             row.Type = a.Type; 
        //             row.Industry = a.Industry; 
        //             row.Phone = a.Phone; 
        //             results.add(row); } 
        //             return results;
        // } catch (Exception e) {
        //     throw new AuraHandledException('Failed to load Accounts: ' + e.getMessage());
        // }
        for (Account a : accounts) {
            AccountRow row = new AccountRow();
            row.Id = a.Id;
            row.Name = a.Name;
            row.Type = a.Type;
            row.Industry = a.Industry;
            row.Phone = a.Phone;
            results.add(row);
        }
        return results;
    }
        // Get total count (needed for pagination)
    @AuraEnabled(cacheable=true)
    public static Integer getAccountsCount() {
        return [SELECT COUNT() FROM Account];
    }

    @AuraEnabled
    public static void deleteAccounts(List<Id> accountIds) {
        try {
            delete [SELECT Id FROM Account WHERE Id IN :accountIds];
        } catch (Exception e) {
            throw new AuraHandledException('Delete failed: ' + e.getMessage());
        }
    }
}
