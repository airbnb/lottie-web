/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, bm_eventDispatcher, esprima*/

var bm_expressionHelper = (function () {
    'use strict';
    var ob = {};
    var options = {
        tokens: true,
        range: true
    };
    var expressionStr;
    var pendingBodies = [], doneBodies = [];
    function spliceSlice(str, index, count, add) {
        return str.slice(0, index) + (add || "") + str.slice(index + count);
    }
    
    function addReturnStatement(expression) {
        var parsed = esprima.parse(expression, options);
        var body = parsed.body;
        var lastRange = body[body.length - 1].range;
        return spliceSlice(expression, lastRange[0], 0, 'var $bm_rt = ');
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

    function exportNextBody() {
        if (pendingBodies.length === 0) {
            includeUndeclaredVariables();
        } else {
            var next = pendingBodies.shift();
            var preDeclared = [];
            preDeclared = preDeclared.concat(next.pre);
            preDeclared = preDeclared.concat(next.d);
            preDeclared = preDeclared.concat(next.u);
            findUndeclaredVariables(next.body, next.pos, preDeclared);
        }
    }
    
    function findUndeclaredVariables(body, pos, predeclared, declared, undeclared, isContinuation) {

        function addAssignment(expression) {
            var variableName;
            if (expression.left && expression.left.name) {
                variableName = expression.left.name;
                if (declared.indexOf(variableName) === -1 && undeclared.indexOf(variableName) === -1) {
                    undeclared.push(variableName);
                }
            }
        }
        
        function addSequenceExpressions(expressions) {
            var i, len = expressions.length;
            for (i = 0; i < len; i += 1) {
                if (expressions[i].type === 'AssignmentExpression') {
                    addAssignment(expressions[i]);
                }
            }
        }

        function addDeclaredVariable(variableName) {
            if (declared.indexOf(variableName) === -1) {
                declared.push(variableName);
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
        len = body.length;
        var j, jLen, expression, declarations;
        for (i = 0; i < len; i += 1) {
            if (body[i].type === 'VariableDeclaration') {
                declarations = body[i].declarations;
                jLen = declarations.length;
                for (j = 0; j < jLen; j += 1) {
                    if (declarations[j].type === 'VariableDeclarator') {
                        if (declarations[j].id && declarations[j].id.name) {
                            addDeclaredVariable(declarations[j].id.name);
                        }
                    }
                }
            } else if (body[i].type === 'ExpressionStatement') {
                expression = body[i].expression;
                if (expression.type === 'AssignmentExpression') {
                    addAssignment(expression);
                } else if (expression.type === 'SequenceExpression') {
                    addSequenceExpressions(expression.expressions);
                }
                //
            } else if (body[i].type === 'ForStatement') {
                if (body[i].init) {
                    if (body[i].init.type === 'SequenceExpression') {
                        addSequenceExpressions(body[i].init.expressions);
                    } else if (body[i].init.type === 'AssignmentExpression') {
                        addAssignment(body[i].init);
                    }
                }
                if (body[i].body) {
                    if (body[i].body.type === 'BlockStatement') {
                        findUndeclaredVariables(body[i].body.body, 0, null, declared, undeclared, true);
                    } else if (body[i].body.type === 'ExpressionStatement') {
                        expression = body[i].body.expression;
                        if (expression.type === 'AssignmentExpression') {
                            addAssignment(expression);
                        } else if (expression.type === 'SequenceExpression') {
                            addSequenceExpressions(expression.expressions);
                        }
                        //addAssignment(body[i].body);
                    }
                }
            } else if (body[i].type === 'FunctionDeclaration') {
                if (body[i].body && body[i].body.type === 'BlockStatement') {
                    var p = [];
                    if (body[i].params) {
                        jLen = body[i].params.length;
                        for (j = 0; j < jLen; j += 1) {
                            p.push(body[i].params[j].name);
                        }
                    }
                    pendingBodies.push({body: body[i].body.body, d: declared, u: undeclared, pre: p, pos: body[i].body.range[0] + 1});
                }
            }
        }
        if (!isContinuation) {
            doneBodies.push({u: undeclared, p: pos});
            exportNextBody();
        }
    }
    
    function searchUndeclaredVariables() {
        var parsed = esprima.parse(expressionStr, options);
        var body = parsed.body;
        pendingBodies.push({body: body, d: [], u: [], pre: [], pos: 0});
        exportNextBody();
    }
    
    function checkExpression(prop, returnOb) {
        if (prop.expressionEnabled && !prop.expressionError) {
            pendingBodies.length = 0;
            doneBodies.length = 0;
            expressionStr = '';
            expressionStr = addReturnStatement(prop.expression);
            searchUndeclaredVariables();
            returnOb.x = expressionStr;
            bm_eventDispatcher.log(expressionStr);
        }
    }
    
    ob.checkExpression = checkExpression;
    
    return ob;
}());