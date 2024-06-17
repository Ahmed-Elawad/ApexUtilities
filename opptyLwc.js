import { LightningElement, wire, track } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { NavigationMixin } from 'lightning/navigation';

export default class OpportunityList extends NavigationMixin(LightningElement) {
    @track columns = [
        { label: 'Opportunity Name', fieldName: 'Name', type: 'button', 
          typeAttributes: { label: { fieldName: 'Name' }, variant: 'base' }},
        { label: 'Stage', fieldName: 'StageName', type: 'text' },
        { label: 'Auto Close Date', fieldName: 'Auto_Close_Date__c', type: 'date' },
        { label: 'Scheduled Presentation', fieldName: 'ScheduledPresentation', type: 'date' },
        { label: 'Initial Discovery Completed', fieldName: 'DiscoveryCompleted', type: 'boolean', editable: false },
        { label: 'Launch Flow', type: 'button', typeAttributes: { label: 'Launch Flow', name: 'launch_flow', variant: 'brand' }}
    ];

    @track opportunities = [];
    @track error;

    // Wire service to fetch opportunities list
    @wire(getListUi, {
        objectApiName: 'Opportunity',
        listViewApiName: 'AllOpportunities' // Adjust this API name as per your actual list view
    })
    wiredOpportunities({ error, data }) {
        if (data) {
            this.opportunities = data.records.records.map(record => ({
                Id: record.id,
                Name: record.fields.Name.value,
                StageName: record.fields.StageName.value,
                Auto_Close_Date__c: record.fields.Auto_Close_Date__c.value,
                ScheduledPresentation: record.fields.ScheduledPresentation.value, // Adjust this based on actual API field names
                DiscoveryCompleted: false // This can be adjusted as per your logic later
            }));
        } else if (error) {
            this.error = error;
            console.error('Error fetching opportunities:', error);
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'launch_flow':
                this.launchFlow(row);
                break;
            default:
                this.navigateToRecordPage(row.Id);
        }
    }

    launchFlow(row) {
        // Navigate to Flow
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'flowruntime:flowRuntime'
            },
            state: {
                recordId: row.Id,
                flowName: 'Initial_Discovery'
            }
        });
    }

    navigateToRecordPage(recordId) {
        // Navigate to Record Page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }
}
