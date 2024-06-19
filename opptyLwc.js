import { LightningElement, wire, track } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { NavigationMixin } from 'lightning/navigation';
import Id from "@salesforce/user/Id";
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class ManageIEUPOpportunities extends LightningElement {
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
    
        connectedCallback() {
            this.loadOpportunities();
        }
    
        loadOpportunities() {
            const query = `
            {
                opportunities(filters: {
                    AND: [
                        { CloseDate: { LESS_THAN_OR_EQUAL: "NEXT_N_DAYS:7" } },
                        { CloseDate: { GREATER_THAN_OR_EQUAL: "TODAY" } }
                    ]
                }) {
                    records {
                        Name
                        StageName
                        Auto_Close_Date__c
                        ScheduledPresentation: Events(fields: ["ScheduledDate"], filters: { Type: { EQUALS: "Presentation initial" } })
                    }
                }
            }`;
            
            graphql(query)
            .then(result => {
                this.opportunities = result.data.opportunities.records.map(record => {
                    return {
                        ...record,
                        DiscoveryCompleted: false // Placeholder until logic added
                    };
                });
            })
            .catch(error => {
                this.error = error;
                console.error('GraphQL query error:', error);
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
