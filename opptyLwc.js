import { LightningElement, wire, track } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { NavigationMixin } from 'lightning/navigation';
import Id from "@salesforce/user/Id";
import { gql, graphql } from "lightning/uiGraphQLApi";


export default class ManageIEUPOpportunities extends LightningElement {
    userId = Id;
    @track columns = [
        { label: 'Opportunity Name', fieldName: 'Name', type: 'button', 
          typeAttributes: { label: { fieldName: 'Name' }, variant: 'base' }},
        { label: 'Stage', fieldName: 'StageName', type: 'text' },
        { label: 'Auto Close Date', fieldName: 'Auto_Close_Date__c', type: 'date' },
        { label: 'Scheduled Presentation', fieldName: 'ScheduledPresentation', type: 'date' },
        { label: 'Initial Discovery Completed', fieldName: 'DiscoveryCompleted', type: 'boolean', editable: false },
        { label: 'Launch Flow', type: 'button', typeAttributes: { label: 'Launch Flow', name: 'launch_flow', variant: 'brand' }}
    ];
    connectedCallback() {
        console.log('here')
        // this.loadOpportunities()
    }

    @track opportunities = [];
    @track error;
    @wire(graphql, {
        query: gql`
          query IeupOpporunity() {
            uiapi {
                query {
                Opportunity ( where: {
                    and: [
                        Initial_Presentation_outcome__c {eq: "Pending" }
                    ]
                }) {
                  edges {
                    node {
                      Id
                      Name {
                        value
                      }
                    }
                  }
                }
              }
            }
        }`,
        variables: "$variables"
      })
      graphqlQueryResult({ data, errors }) {
        console.log('here')
        if (data) {
            console.log(JSON.stringify(data));
            debugger;
        }
      }
    
      get variables() {
        return {
            ownerId : this.userId,
        };
      }

    handleRowAction(event) {
        debugger;
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
        debugger;
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
        debugger;
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

