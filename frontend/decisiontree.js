export const decisionTree = {
    DC5: { yes: 'DC2', no: 'DC7' },
    DC2: { yes: 'DC4', no: 'DC12' },
    DC12: { yes: 'REPURCHASE', no: 'REPLATFORM' },
    DC7: { yes: 'DC9', no: 'DC8' },
    DC8: { yes: 'DC1', no: 'DC10' },
    DC10: { yes: 'REHOST', no: 'RETAIN' },
    DC9: { yes: 'DC11', no: 'RETIRE' },
    DC11: { yes: 'RETAIN', no: 'REHOST' },
    DC4: { yes: 'DC12', no: 'DC6' },
    DC1: { yes: 'DC3', no: 'DC6' },
    DC3: { yes: 'DC6', no: 'REFACTOR' },
    DC6: { yes: 'REARCHITECT', no: 'REFACTOR' }
};