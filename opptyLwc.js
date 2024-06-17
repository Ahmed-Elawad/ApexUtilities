import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';

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

    connectedCallback() {
        getOpportunities()
            .then(result => {
                this.opportunities = result.map(row => {
                    return {...row, DiscoveryCompleted: false } // Assuming 'Initial Discovery' flow status logic added later
                });
            })
            .catch(error => {
                this.error = error;
            });
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
