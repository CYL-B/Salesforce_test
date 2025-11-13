public with sharing class AccountsListController {
    public class AccountRow { 
        @AuraEnabled public Id Id { get; set; } 
        @AuraEnabled public String Name { get; set; } 
        @AuraEnabled public String Type { get; set; } 
        @AuraEnabled public String Industry { get; set; } 
        @AuraEnabled public String Phone { get; set; } }

    @AuraEnabled(cacheable=true)
    public static List<AccountRow> getAccounts(Integer limitSize) {
        Integer rows = (limitSize == null || limitSize <= 0) ? 10 : limitSize;
        List<AccountRow> results = new List<AccountRow>();
        try {
            for (Account a : [ 
                SELECT Id, Name, Type, Industry, Phone, Website 
                FROM Account 
                ORDER BY Name 
                LIMIT :rows ]) { 
                    AccountRow row = new AccountRow(); 
                    row.Id = a.Id; 
                    row.Name = a.Name; 
                    row.Type = a.Type; 
                    row.Industry = a.Industry; 
                    row.Phone = a.Phone; 
                    results.add(row); } 
                    return results;
        } catch (Exception e) {
            throw new AuraHandledException('Failed to load Accounts: ' + e.getMessage());
        }
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
