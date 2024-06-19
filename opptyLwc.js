import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { gql, graphql } from 'lightning/uiGraphQLApi';
import userId from '@salesforce/user/Id';

export default class ManageIEUPOpportunities extends NavigationMixin(LightningElement) {
    @track opportunities = [];
    @track error;
    userId = userId;

    @track columns = [
        { label: 'Opportunity Name', fieldName: 'Name', type: 'button', 
          typeAttributes: { label: { fieldName: 'Name' }, variant: 'base' }},
        { label: 'Stage', fieldName: 'StageName', type: 'text' },
        { label: 'Auto Close Date', fieldName: 'Auto_Close_Date__c', type: 'date' },
        { label: 'Scheduled Presentation', fieldName: 'ScheduledPresentation', type: 'date' },
        { label: 'Initial Discovery Completed', fieldName: 'DiscoveryCompleted', type: 'boolean', editable: false },
        { label: 'Launch Flow', type: 'button', typeAttributes: { label: 'Launch Flow', name: 'launch_flow', variant: 'brand' }}
    ];

    @wire(graphql, {
        query: gql`
          query GetOpportunities($ownerId: String) {
            Opportunity (filter: {OwnerId: {_eq: $ownerId}, Initial_Presentation_outcome__c: {_eq: "Pending"}}) {
              edges {
                node {
                  Id
                  Name
                  StageName
                  Auto_Close_Date__c
                  ScheduledPresentation
                  DiscoveryCompleted
                }
              }
            }
          }
        `,
        variables: {
            ownerId: this.userId
        }
    })
    wiredOpportunities({ error, data }) {
        if (data) {
            this.opportunities = data.Opportunity.edges.map(edge => edge.node);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.error('Error fetching opportunities with GraphQL:', error);
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
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }
}
