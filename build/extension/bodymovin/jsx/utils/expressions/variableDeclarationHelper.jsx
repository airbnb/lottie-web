/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, esprima, escodegen*/

$.__bodymovin.bm_variableDeclarationHelper = (function () {
    'use strict';
    var esprima = $.__bodymovin.esprima;
    var ob = {
        searchUndeclaredVariables: searchUndeclaredVariables
    };
    var options = {
        tokens: true,
        range: true
    };
    var pendingBodies = [], doneBodies = [], expressionStr;

    function searchUndeclaredVariables(originalExpressionString) {
        expressionStr = originalExpressionString;
        pendingBodies.length = 0;
        doneBodies.length = 0;
        var parsed = esprima.parse(expressionStr, options);
        var body = parsed.body;
        pendingBodies.push({body: body, d: [], u: [], pre: [], pos: 0});
        exportNextBody();
        return expressionStr;
    }
    
    function spliceSlice(str, index, count, add) {
        return str.slice(0, index) + (add || "") + str.slice(index + count);
    }

    function exportNextBody() {
        if (pendingBodies.length === 0) {
            includeUndeclaredVariables();
        } else {
            var next = pendingBodies.shift();
            var preDeclared = [];
            preDeclared = preDeclared.concat(next.pre);
            preDeclared = preDeclared.concat(next.d);
            preDeclared = preDeclared.concat(next.u);
            return findUndeclaredVariables(next.body, next.pos, preDeclared);
        }
    }

    function findUndeclaredVariables(body, pos, predeclared, declared, undeclared, isContinuation) {

        function addAssignment(expression) {
            var variableName;
            if (expression.left && expression.left.name) {
                variableName = expression.left.name;
                if(variableName === 'value'){
                    return;
                }
                var i = 0, len = declared.length;
                while (i < len) {
                    if (declared[i] === variableName) {
                        return;
                    }
                    i += 1;
                }
                i = 0;
                len = declared.length;
                while (i < len) {
                    if (undeclared[i] === variableName) {
                        return;
                    }
                    i += 1;
                }
                undeclared.push(variableName);
            }
        }

        function addSequenceExpressions(expressions) {
            var i, len = expressions.length;
            for (i = 0; i < len; i += 1) {
                if (expressions[i].type === 'AssignmentExpression') {
                    addAssignment(expressions[i]);
                } else if (expressions[i].type === 'SequenceExpression') {
                    addSequenceExpressions(expressions[i].expressions);
                }
            }
        }

        function addDeclaredVariable(variableName) {
            var i = 0, len = declared.length;
            while (i < len) {
                if (declared[i] === variableName) {
                    return;
                }
                i += 1;
            }
            declared.push(variableName);
        }

        function addIfStatement(statement){
            if(statement.consequent){
                if (statement.consequent.type === 'BlockStatement') {
                    findUndeclaredVariables(statement.consequent.body, 0, null, declared, undeclared, true);
                } else if (statement.consequent.type === 'ExpressionStatement') {
                    var expression = statement.consequent.expression;
                    if (expression.type === 'AssignmentExpression') {
                        addAssignment(expression);
                    } else if (expression.type === 'SequenceExpression') {
                        iterateElements(expression.expressions);
                    }
                } else if (statement.consequent.type === 'ReturnStatement') {
                    //
                } else if (statement.consequent.type === 'IfStatement') {
                    addIfStatement(statement.consequent)
                } else {
                    // console.log(statement.consequent.type)
                }
            }
            if (statement.alternate) {
                if (statement.alternate.type === 'IfStatement') {
                    addIfStatement(statement.alternate)
                } else if (statement.alternate.type === 'BlockStatement') {
                    findUndeclaredVariables(statement.alternate.body, 0, null, declared, undeclared, true);
                } else if (statement.alternate.type === 'ExpressionStatement') {
                    expression = statement.alternate.expression;
                    if (expression.type === 'AssignmentExpression') {
                        addAssignment(expression);
                    } else if (expression.type === 'SequenceExpression') {
                        iterateElements(expression.expressions);
                    }
                }
            }
        }

        function addTryStatement(statement){
            if (statement.block) {
                if (statement.block.type === 'BlockStatement') {
                    findUndeclaredVariables(statement.block.body, 0, null, declared, undeclared, true);
                }
            }
            if (statement.handler) {
                if (statement.handler.body.type === 'BlockStatement') {
                    findUndeclaredVariables(statement.handler.body.body, 0, null, declared, undeclared, true);
                }
            }
        }

        function addSwitchStatement(statement) {
            var i, len = statement.cases.length;
            for (i = 0; i < len; i += 1) {
                findUndeclaredVariables(statement.cases[i].consequent, 0, null, declared, undeclared, true);
            }
        }

        if (!declared) {
            declared = [];
        }
        if (!undeclared) {
            undeclared = [];
        }
        var i, len;
        if (predeclared) {
            len = predeclared.length;
            for (i = 0; i < len; i += 1) {
                declared.push(predeclared[i]);
            }
        }

        function iterateElements(_body) {
            var i, len = _body.length;
            var j, jLen, expression, declarations, element;
            for (i = 0; i < len; i += 1) {
                element = _body[i];
                if (element.type === 'AssignmentExpression') {
                        addAssignment(element);
                } else if (element.type === 'SequenceExpression') {
                        iterateElements(element.expressions);
                } else if (element.type === 'ConditionalExpression') {
                    if(element.consequent) {
                        if(element.consequent.type === 'AssignmentExpression') {
                            addAssignment(element.consequent);
                        } else if(element.consequent.type === 'SequenceExpression') {
                            iterateElements(element.consequent.expressions);
                        }
                    }
                    if(element.alternate) {
                        if(element.alternate.type === 'AssignmentExpression') {
                            addAssignment(element.alternate);
                        } else if(element.alternate.type === 'SequenceExpression') {
                            iterateElements(element.alternate.expressions);
                        }
                        addAssignment(element.alternate);
                    }
                } else if (element.type === 'VariableDeclaration') {
                    declarations = element.declarations;
                    jLen = declarations.length;
                    for (j = 0; j < jLen; j += 1) {
                        if (declarations[j].type === 'VariableDeclarator') {
                            if (declarations[j].id && declarations[j].id.name) {
                                addDeclaredVariable(declarations[j].id.name);
                            }
                        }
                    }
                } else if (element.type === 'ExpressionStatement') {
                    expression = element.expression;
                    if (expression.type === 'AssignmentExpression') {
                        addAssignment(expression);
                    } else if (expression.type === 'SequenceExpression') {
                        iterateElements(expression.expressions);
                    } else if (expression.type === 'ConditionalExpression') {
                        if(expression.consequent) {
                            if(expression.consequent.type === 'AssignmentExpression') {
                                addAssignment(expression.consequent);
                            } else if(expression.consequent.type === 'SequenceExpression') {
                                iterateElements(expression.consequent.expressions);
                            }
                        }
                        if(expression.alternate) {
                            if(expression.alternate.type === 'AssignmentExpression') {
                                addAssignment(expression.alternate);
                            } else if(expression.alternate.type === 'SequenceExpression') {
                                iterateElements(expression.alternate.expressions);
                            }
                            addAssignment(expression.alternate);
                        }
                    }
                    //
                } else if (element.type === 'ForStatement') {
                    if (element.init) {
                        if (element.init.type === 'SequenceExpression') {
                            iterateElements(element.init.expressions);
                        } else if (element.init.type === 'AssignmentExpression') {
                            addAssignment(element.init);
                        }
                    }
                    if (element.body) {
                        if (element.body.type === 'BlockStatement') {
                            findUndeclaredVariables(element.body.body, 0, null, declared, undeclared, true);
                        } else if (element.body.type === 'ExpressionStatement') {
                            expression = element.body.expression;
                            if (expression.type === 'AssignmentExpression') {
                                addAssignment(expression);
                            } else if (expression.type === 'SequenceExpression') {
                                iterateElements(expression.expressions);
                            }
                            //addAssignment(element.body);
                        }
                    }
                } else if (element.type === 'IfStatement') {
                    addIfStatement(element);
                } else if (element.type === 'TryStatement') {
                    addTryStatement(element);
                } else if (element.type === 'SwitchStatement') {
                    addSwitchStatement(element);
                } else if (element.type === 'FunctionDeclaration') {
                    if (element.body && element.body.type === 'BlockStatement') {
                        var p = [];
                        if (element.params) {
                            jLen = element.params.length;
                            for (j = 0; j < jLen; j += 1) {
                                p.push(element.params[j].name);
                            }
                        }
                        pendingBodies.push({body: element.body.body, d: declared, u: undeclared, pre: p, pos: element.body.range[0] + 1});
                    }
                } else if (element.type === 'ReturnStatement') {
                    if (element.argument && element.argument.type === 'CallExpression' && element.argument.callee.body) {
                        pendingBodies.push({body: element.argument.callee.body.body, d: declared, u: undeclared, pre: p, pos: element.argument.callee.body.range[0] + 1});
                    }
                } else if (element.type === 'BlockStatement') {
                    findUndeclaredVariables(element.body, 0, null, declared, undeclared, true);
                } else if (element.type === 'LogicalExpression') {
                    if(element.right) {
                        if(element.right.type === 'AssignmentExpression') {
                            addAssignment(element.right)
                        }
                    }
                    if(element.left) {
                        if(element.left.type === 'AssignmentExpression') {
                            addAssignment(element.left)
                        }
                    }
                }
            }
        }
        iterateElements(body);
        
        if (!isContinuation) {
            doneBodies.push({u: undeclared, p: pos});
            exportNextBody();
        }
    }

    function includeUndeclaredVariables() {
        doneBodies.sort(function (a, b) {
            return parseInt(b.p, 10) - parseInt(a.p, 10);
        });
        var i, len = doneBodies.length;
        var declarationStr = '';
        for (i = 0; i < len; i += 1) {
            if (doneBodies[i].u.length) {
                declarationStr = 'var ' + doneBodies[i].u.join(',') + ';';
                expressionStr = spliceSlice(expressionStr, doneBodies[i].p, 0, declarationStr);
            }
        }
    }

    return ob

}())