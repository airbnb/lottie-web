/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, bm_eventDispatcher, esprima, escodegen*/

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


    function searchOperations(body) {
        var i, len = body.length;
        for (i = 0; i < len; i += 1) {
            if (body[i].type === 'ExpressionStatement') {
                handleExpressionStatement(body[i]);
            } else if (body[i].type === 'IfStatement') {
                handleIfStatement(body[i]);
            } else if (body[i].type === 'FunctionDeclaration') {
                handleFunctionDeclaration(body[i]);
            } else if (body[i].type === 'WhileStatement') {
                handleWhileStatement(body[i]);
            } else if (body[i].type === 'ForStatement') {
                handleForStatement(body[i]);
            } else if (body[i].type === 'VariableDeclaration') {
                handleVariableDeclaration(body[i]);
            } else if (body[i].type === 'ReturnStatement') {
                handleReturnStatement(body[i]);
            } else {
                bm_eventDispatcher.log(body[i].type);
                bm_eventDispatcher.log(body[i]);
            }
        }
    }

    function getBinaryElement(element) {
        switch (element.type) {
        case "Literal":
        case "Identifier":
            return element;
        case "CallExpression":
            handleCallExpression(element);
            return element;
        case "BinaryExpression":
            return convertBinaryExpression(element);
        default:
            bm_eventDispatcher.log('es: ', element);
            return element;
        }
    }

    function getOperatorName(operator) {
        switch (operator) {
        case '+':
            return 'sum';
        case '-':
            return 'sub';
        case '*':
            return 'mul';
        case '/':
            return 'div';

        }
    }

    function convertBinaryExpression(expression) {
        if (expression.left.type === 'Literal' && expression.right.type === 'Literal') {
            return expression;
        }
        var callStatementOb = {
            'arguments': [
                getBinaryElement(expression.left),
                getBinaryElement(expression.right)
            ],
            type: "CallExpression",
            callee: {
                name: getOperatorName(expression.operator),
                type: 'Identifier'
            }
        };
        return callStatementOb;
    }

    function handleCallExpression(expression) {
        var args = expression['arguments'];
        var i, len = args.length;
        for (i = 0; i < len; i += 1) {
            if (args[i].type === 'BinaryExpression') {
                args[i] = convertBinaryExpression(args[i]);
            }
        }
    }

    function handleIfStatement(ifStatement) {
        if (ifStatement.consequent) {
            if (ifStatement.consequent.type === 'BlockStatement') {
                searchOperations(ifStatement.consequent.body);
            } else if (ifStatement.consequent.type === 'ExpressionStatement') {
                handleExpressionStatement(ifStatement.consequent);
            }
        }
        if (ifStatement.alternate) {
            if (ifStatement.alternate.type === 'IfStatement') {
                handleIfStatement(ifStatement.alternate);
            } else if (ifStatement.alternate.type === 'BlockStatement') {
                searchOperations(ifStatement.alternate.body);
            } else if (ifStatement.alternate.type === 'ExpressionStatement') {
                handleExpressionStatement(ifStatement.alternate);
            }
        }
    }

    function handleWhileStatement(whileStatement) {
        if (whileStatement.body) {
            if (whileStatement.body.type === 'BlockStatement') {
                searchOperations(whileStatement.body.body);
            } else if (whileStatement.body.type === 'ExpressionStatement') {
                handleExpressionStatement(whileStatement.body);
            }
        }
    }

    function handleForStatement(forStatement) {
        if (forStatement.body) {
            if (forStatement.body.type === 'BlockStatement') {
                searchOperations(forStatement.body.body);
            } else if (forStatement.body.type === 'ExpressionStatement') {
                handleExpressionStatement(forStatement.body);
            }
        }
    }

    function handleReturnStatement(returnStatement) {
        if (returnStatement.argument) {
            returnStatement.argument = getBinaryElement(returnStatement.argument);
        }
    }

    function handleVariableDeclaration(variableDeclaration) {
        var declarations = variableDeclaration.declarations;
        var i, len = declarations.length;
        for (i = 0; i < len; i += 1) {
            if (declarations[i].init) {
                if (declarations[i].init.type === 'BinaryExpression') {
                    declarations[i].init = convertBinaryExpression(declarations[i].init);
                }
            }
        }
    }

    function handleExpressionStatement(expressionStatement) {
        if (expressionStatement.expression.type === 'CallExpression') {
            handleCallExpression(expressionStatement.expression);
        }
    }

    function handleFunctionDeclaration(functionDeclaration) {
        if (functionDeclaration.body && functionDeclaration.body.type === 'BlockStatement') {
            searchOperations(functionDeclaration.body.body);
        }
    }

    function replaceOperations() {
        var parsed = esprima.parse(expressionStr, options);
        var body = parsed.body;
        searchOperations(body);
        var escodegen = ob.escodegen;
        expressionStr = escodegen.generate(parsed);
    }

    function checkExpression(prop, returnOb) {
        if (prop.expressionEnabled && !prop.expressionError) {
            pendingBodies.length = 0;
            doneBodies.length = 0;
            expressionStr = prop.expression;
            searchUndeclaredVariables();
            replaceOperations();

            expressionStr = addReturnStatement(expressionStr);
            returnOb.x = expressionStr;
        }
    }

    ob.checkExpression = checkExpression;

    return ob;
}());