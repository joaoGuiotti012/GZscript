export const OPERATORS = [
    '<<',
    '>>',
    '(',
    ')',
    'LT',
    'BT',
    'LTEQ',
    'BTEQ',
    'NE',
    '<>',
    'EQ',
    'NOT',
    '=',
    '+',
    '-',
    '/',
    '*',
    'PER',
    'AND',
    'OR',
];

export function isOperator(v): boolean {
    return OPERATORS.includes(v);
}