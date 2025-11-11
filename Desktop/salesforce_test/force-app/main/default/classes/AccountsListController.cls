public with sharing class AccountsListController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(Integer limitSize) {
        Integer rows = (limitSize == null || limitSize <= 0) ? 10 : limitSize;
        try {
            return [
                SELECT Id, Name, Industry, Type, Phone, Website
                FROM Account
                ORDER BY LastModifiedDate DESC
                LIMIT :rows
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Failed to load Accounts: ' + e.getMessage());
        }
    }
}
