/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, esprima, escodegen*/

$.__bodymovin.bm_valueAssignmentHelper = (function () {
    'use strict';
    var ob = {
    	assignVariable: assignVariable
    };

    function assignVariable(body){
        var len = body.length - 1;
        var flag = len >= 0 ? true : false;
        var lastElem;
        while (flag) {
            lastElem = body[len];
            if(lastElem.type === 'IfStatement'){
                assignVariableToIfStatement(lastElem);
                body[len] = lastElem;
                len -= 1;
            } else if (lastElem.type === 'SwitchStatement') {
                assignVariableToSwitchStatement(lastElem); 
                body[len] = lastElem;
                flag = false;
            } else if (lastElem.type === 'ExpressionStatement') {
                lastElem = convertExpressionStatementToVariableDeclaration(lastElem);
                body[len] = lastElem;
                flag = false;
            } else if (lastElem.type === 'TryStatement') {
                if (lastElem.block) {
                    if (lastElem.block.type === 'BlockStatement') {
                        assignVariable(lastElem.block.body);
                    }
                }
                if (lastElem.handler) {
                    if (lastElem.handler.body.type === 'BlockStatement') {
                        assignVariable(lastElem.handler.body.body);
                    }
                }
                body[len] = lastElem;
                flag = false;
            } else if ((lastElem.type !== 'EmptyStatement' && lastElem.type !== 'FunctionDeclaration' && lastElem.type !== 'BreakStatement') || len === 0) {
                flag = false;
            } else {
                len -= 1;
            }
            if(len < 0){
                flag = false;
            }
        }
    }

    function convertExpressionStatementToVariableDeclaration(expressionStatement) {
        var assignmentObject;
        if(expressionStatement.expression.type === 'Literal'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'Identifier'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'CallExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'ArrayExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'BinaryExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'MemberExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'LogicalExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'UnaryExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'ConditionalExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'AssignmentExpression'){
            assignmentObject = createAssignmentObject();
            assignmentObject.expression.right = expressionStatement.expression;
            return assignmentObject;
        } else if(expressionStatement.expression.type === 'SequenceExpression'){
            assignmentObject = createAssignmentExpressionObject();
            assignmentObject.right = expressionStatement.expression.expressions[expressionStatement.expression.expressions.length - 1];
            expressionStatement.expression.expressions[expressionStatement.expression.expressions.length - 1] = assignmentObject;
        }
        return expressionStatement;
    }

    function assignVariableToIfStatement(ifStatement){
        if (ifStatement.consequent) {
            if (ifStatement.consequent.type === 'BlockStatement') {
                assignVariable(ifStatement.consequent.body);
            } else if (ifStatement.consequent.type === 'ExpressionStatement') {
                ifStatement.consequent = convertExpressionStatementToVariableDeclaration(ifStatement.consequent);
            }
        }
        if (ifStatement.alternate) {
            if (ifStatement.alternate.type === 'IfStatement') {
                assignVariableToIfStatement(ifStatement.alternate);
            } else if (ifStatement.alternate.type === 'BlockStatement') {
                assignVariable(ifStatement.alternate.body);
            } else if (ifStatement.alternate.type === 'ExpressionStatement') {
                ifStatement.alternate = convertExpressionStatementToVariableDeclaration(ifStatement.alternate);
            }
        }
    }

    function assignVariableToSwitchStatement(switchStatement) {
        var cases = switchStatement.cases;
        var i, len = cases.length;
        for (i = 0; i < len; i += 1) {
            if (cases[i].consequent.length) {
                assignVariable(cases[i].consequent)
            }
        }
    }

    function createAssignmentObject(){
        return {
            type: 'ExpressionStatement',
            expression: createAssignmentExpressionObject()
        }
    }

    function createAssignmentExpressionObject(){
        return {
                left: {
                    name: '$bm_rt',
                        type: 'Identifier'
                },
                type: "AssignmentExpression",
                    operator: '='
            }
    }

    return ob;

}())