/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, esprima, escodegen*/

$.__bodymovin.bm_expressionHelper = (function () {
    var esprima = $.__bodymovin.esprima;
    var variableDeclaration_helper = $.__bodymovin.bm_variableDeclarationHelper;
    var valueAssignment_helper = $.__bodymovin.bm_valueAssignmentHelper;
    var reservedProperties_helper = $.__bodymovin.bm_reserverPropertiesHelper;
    var ob = {};
    var options = {
        tokens: true,
        range: true
    };
    var expressionStr;
    var separate_functions = {bodies:[],names:[]};

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
            } else if (body[i].type === 'TryStatement') {
                handleTryStatement(body[i]);
            } else if (body[i].type === 'SwitchStatement') {
                handleSwitchStatement(body[i]);
            } else {
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
            case "UnaryExpression":
                return convertUnaryExpression(element);
            case "MemberExpression":
                handleMemberExpression(element);
                return element;
            case "UpdateExpression":
                return element;
            default:
                return element;
        }
    }

    function getOperatorName(operator) {
        switch (operator) {
            case '+':
                return '$bm_sum';
            case '-':
                return '$bm_sub';
            case '*':
                return '$bm_mul';
            case '/':
                return '$bm_div';
            case '%':
                return '$bm_mod';
            default:
                return '$bm_sum';

        }
    }

    function isOperatorTransformable(operator){
        switch(operator){
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
                return true;
            default:
                return false;
        }
    }

    function convertBinaryExpression(expression) {
        if (expression.left.type === 'Literal' && expression.right.type === 'Literal') {
            return expression;
        }
        var callStatementOb;
        if(expression.operator === 'instanceof' && expression.right.type === 'Identifier' && expression.right.name === 'Array') {
            callStatementOb = {
                'arguments': [
                    getBinaryElement(expression.left)
                ],
                type: "CallExpression",
                callee: {
                    name: '$bm_isInstanceOfArray',
                    type: 'Identifier'
                }
            };
        } else if(!isOperatorTransformable(expression.operator)){
            if(expression.left.type === 'BinaryExpression') {
                expression.left = getBinaryElement(expression.left);
            }
            if(expression.right.type === 'BinaryExpression') {
                expression.right = getBinaryElement(expression.right);
            }
            callStatementOb = expression;
        } else {
            callStatementOb = {
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
        }
        return callStatementOb;
    }

    function convertUnaryExpression(expression){
        if(expression.operator === '-' && expression.argument.type !== 'Literal'){
            var callStatementOb = {
                'arguments': [
                    getBinaryElement(expression.argument)
                ],
                type: "CallExpression",
                callee: {
                    name: '$bm_neg',
                    type: 'Identifier'
                }
            };
            return callStatementOb;
        }
        return expression;
    }

    function handleMemberExpression(expression) {
        if (expression.property.type === 'BinaryExpression') {
            expression.property = convertBinaryExpression(expression.property);
        } else if (expression.property.type === 'UnaryExpression') {
            expression.property = convertUnaryExpression(expression.property);
        } else if (expression.property.type === 'CallExpression') {
            handleCallExpression(expression.property);
        }
        if (expression.object){
            if (expression.object.type === 'BinaryExpression') {
                expression.object = convertBinaryExpression(expression.property);
            } else if (expression.object.type === 'UnaryExpression') {
                expression.object = convertUnaryExpression(expression.property);
            } else if (expression.object.type === 'CallExpression') {
                handleCallExpression(expression.object);
            }
        }
    }

    function handleCallExpression(expression) {
        var args = expression['arguments'];
        handleSequenceExpressions(args);
        if(expression.callee.name === 'eval'){
            var wrappingNode = {
                type: 'MemberExpression',
                computed: true,
                object: {
                    type: 'ArrayExpression',
                    elements: [
                        args[0]
                    ]

                },
                property: {
                    value: 0,
                    type: 'Literal',
                    raw: '0'
                }
            }
            args[0] = wrappingNode
        } else if (expression.callee.type === 'FunctionExpression') {
            handleFunctionDeclaration(expression.callee);
        } else {
            replaceCalledExpressionIdentifier(expression);
        }
    }

    function findFunctionNameInFunctions(name) {
        var names = separate_functions.names;
        var _index = -1;
        var i = names.length - 1;
        while(i >= 0) {
            if(names[i] === name) {
                _index = i;
                break;
            }
            i -= 1;
        }
        return _index;
    }

    function replaceCalledExpressionIdentifier(expression) {
        var index = findFunctionNameInFunctions(expression.callee.name);
        if(index !== -1) {
            expression.callee.type = 'MemberExpression';
            expression.callee.computed = true;
            expression.callee.object = {type:'Identifier', name: '__expression_functions'};
            expression.callee.property = {type:'Literal', raw: index.toString(), value: index}
        }
    }

    function handleIfStatement(ifStatement) {
        if(ifStatement.test.type === 'BinaryExpression') {
            ifStatement.test = convertBinaryExpression(ifStatement.test);
        }
        if (ifStatement.consequent) {
            if (ifStatement.consequent.type === 'BlockStatement') {
                searchOperations(ifStatement.consequent.body);
            } else if (ifStatement.consequent.type === 'ExpressionStatement') {
                handleExpressionStatement(ifStatement.consequent);
            } else if (ifStatement.consequent.type === 'ReturnStatement') {
                handleReturnStatement(ifStatement.consequent);
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

    function handleTryStatement(tryStatement) {
        if (tryStatement.block) {
            if (tryStatement.block.type === 'BlockStatement') {
                searchOperations(tryStatement.block.body);
            }
        }
        if (tryStatement.handler) {
            if (tryStatement.handler.body.type === 'BlockStatement') {
                searchOperations(tryStatement.handler.body.body);
            }
        }
    }

    function handleSwitchStatement(switchStatement) {
        var cases = switchStatement.cases;
        var i, len = cases.length;
        for(i = 0; i < len; i += 1) {
            searchOperations(cases[i].consequent);
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
        if (whileStatement.test) {
            if (whileStatement.test.type === 'MemberExpression') {
                handleMemberExpression(whileStatement.test);
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
                } else if (declarations[i].init.type === 'UnaryExpression') {
                    declarations[i].init = convertUnaryExpression(declarations[i].init);
                } else if (declarations[i].init.type === 'CallExpression') {
                    handleCallExpression(declarations[i].init);
                } else if (declarations[i].init.type === 'ConditionalExpression') {
                    handleConditionalExpression(declarations[i].init);
                } else if (declarations[i].init.type === 'LogicalExpression') {
                    handleLogicalExpression(declarations[i].init);
                }
            }
        }
    }

    function convertAssignmentToBinaryExpression(assignmentExpression) {
        var function_arguments = [];
        function_arguments.push(assignmentExpression.left);
        function_arguments.push(assignmentExpression.right)
        assignmentExpression.right = {
            type: 'CallExpression',
            arguments: function_arguments,
            callee: {name:getOperatorName(assignmentExpression.operator.substr(0,1)), type:'Identifier'}
        }
        assignmentExpression.operator = '=';
    }

    function handleAssignmentExpression(assignmentExpression) {
        if(assignmentExpression.operator === '+=' || assignmentExpression.operator === '-=') {
            convertAssignmentToBinaryExpression(assignmentExpression)
        }
        if(assignmentExpression.right){
            if(assignmentExpression.right.type === 'BinaryExpression') {
                assignmentExpression.right = convertBinaryExpression(assignmentExpression.right);
            } else if (assignmentExpression.right.type === 'UnaryExpression') {
                assignmentExpression.right = convertUnaryExpression(assignmentExpression.right);
            } else if (assignmentExpression.right.type === 'CallExpression') {
                handleCallExpression(assignmentExpression.right);
            } else  if (assignmentExpression.right.type === 'MemberExpression') {
                handleMemberExpression(assignmentExpression.right);
            } else  if (assignmentExpression.right.type === 'ConditionalExpression') {
                handleConditionalExpression(assignmentExpression.right);
            } else  if (assignmentExpression.right.type === 'ConditionalExpression') {
                handleConditionalExpression(assignmentExpression.right);
            } else  if (assignmentExpression.right.type === 'ArrayExpression') {
                handleSequenceExpressions(assignmentExpression.right.elements);
            } else  if (assignmentExpression.right.type === 'FunctionExpression') {
                handleFunctionDeclaration(assignmentExpression.right);
            } else  if (assignmentExpression.right.type === 'LogicalExpression') {
                handleLogicalExpression(assignmentExpression.right);
            }
        }
    }

    function handleLogicalExpression(logicalExpression) {
        if (logicalExpression.right){
            if (logicalExpression.right.type === 'BinaryExpression') {
                logicalExpression.right = convertBinaryExpression(logicalExpression.right);
            } else if (logicalExpression.right.type === 'UnaryExpression') {
                logicalExpression.right = convertUnaryExpression(logicalExpression.right);
            } else if (logicalExpression.right.type === 'CallExpression') {
                handleCallExpression(logicalExpression.right);
            } else  if (logicalExpression.right.type === 'MemberExpression') {
                handleMemberExpression(logicalExpression.right);
            } else  if (logicalExpression.right.type === 'ConditionalExpression') {
                handleConditionalExpression(logicalExpression.right);
            } else  if (logicalExpression.right.type === 'ConditionalExpression') {
                handleConditionalExpression(logicalExpression.right);
            } else  if (logicalExpression.right.type === 'ArrayExpression') {
                handleSequenceExpressions(logicalExpression.right.elements);
            } else  if (logicalExpression.right.type === 'FunctionExpression') {
                handleFunctionDeclaration(logicalExpression.right);
            } else  if (logicalExpression.right.type === 'LogicalExpression') {
                handleLogicalExpression(logicalExpression.right);
            }
        }

        if (logicalExpression.left){
            if (logicalExpression.left.type === 'BinaryExpression') {
                logicalExpression.left = convertBinaryExpression(logicalExpression.left);
            } else if (logicalExpression.left.type === 'UnaryExpression') {
                logicalExpression.left = convertUnaryExpression(logicalExpression.left);
            } else if (logicalExpression.left.type === 'CallExpression') {
                handleCallExpression(logicalExpression.left);
            } else  if (logicalExpression.left.type === 'MemberExpression') {
                handleMemberExpression(logicalExpression.left);
            } else  if (logicalExpression.left.type === 'ConditionalExpression') {
                handleConditionalExpression(logicalExpression.left);
            } else  if (logicalExpression.left.type === 'ConditionalExpression') {
                handleConditionalExpression(logicalExpression.left);
            } else  if (logicalExpression.left.type === 'ArrayExpression') {
                handleSequenceExpressions(logicalExpression.left.elements);
            } else  if (logicalExpression.left.type === 'FunctionExpression') {
                handleFunctionDeclaration(logicalExpression.left);
            } else  if (logicalExpression.left.type === 'LogicalExpression') {
                handleLogicalExpression(logicalExpression.left);
            }
        }
    }

    function handleConditionalExpression(conditionalExpression) {
        if(conditionalExpression.test.type === 'BinaryExpression') {
            conditionalExpression.test = convertBinaryExpression(conditionalExpression.test);
        }
        if(conditionalExpression.consequent){
            if (conditionalExpression.consequent.type === 'AssignmentExpression') {
                handleAssignmentExpression(conditionalExpression.consequent);
            } else if (conditionalExpression.consequent.type === 'BinaryExpression') {
                conditionalExpression.consequent = convertBinaryExpression(conditionalExpression.consequent);
            } else if (conditionalExpression.consequent.type === 'SequenceExpression') {
                handleSequenceExpressions(conditionalExpression.consequent.expressions);
            } else if (conditionalExpression.consequent.type === 'CallExpression') {
                handleCallExpression(conditionalExpression.consequent);
            } else if (conditionalExpression.consequent.type === 'LogicalExpression') {
                handleLogicalExpression(conditionalExpression.consequent);
            }
        }
        if(conditionalExpression.alternate){
            if (conditionalExpression.alternate.type === 'AssignmentExpression') {
                handleAssignmentExpression(conditionalExpression.alternate);
            } else if (conditionalExpression.alternate.type === 'BinaryExpression') {
                conditionalExpression.alternate = convertBinaryExpression(conditionalExpression.alternate);
            } else if (conditionalExpression.alternate.type === 'SequenceExpression') {
                handleSequenceExpressions(conditionalExpression.alternate.expressions);
            } else if (conditionalExpression.alternate.type === 'CallExpression') {
                handleCallExpression(conditionalExpression.alternate);
            } else if (conditionalExpression.alternate.type === 'LogicalExpression') {
                handleLogicalExpression(conditionalExpression.alternate);
            }
        }
    }

    function handleSequenceExpressions(expressions) {
        var i, len = expressions.length;
        for (i = 0; i < len; i += 1) {
            if (expressions[i].type === 'CallExpression') {
                handleCallExpression(expressions[i]);
            } else if (expressions[i].type === 'BinaryExpression') {
                expressions[i] = convertBinaryExpression(expressions[i]);
            } else if (expressions[i].type === 'UnaryExpression') {
                expressions[i] = convertUnaryExpression(expressions[i]);
            } else if (expressions[i].type === 'AssignmentExpression') {
                handleAssignmentExpression(expressions[i]);
            } else if (expressions[i].type === 'ConditionalExpression') {
                handleConditionalExpression(expressions[i]);
            } else if (expressions[i].type === 'MemberExpression') {
                handleMemberExpression(expressions[i]);
            } else  if (expressions[i].type === 'ArrayExpression') {
                handleSequenceExpressions(expressions[i].elements);
            } else  if (expressions[i].type === 'LogicalExpression') {
                handleLogicalExpression(expressions[i]);
            }
        }
    }

    function handleExpressionStatement(expressionStatement) {
        if (expressionStatement.expression.type === 'CallExpression') {
            handleCallExpression(expressionStatement.expression);
        } else if (expressionStatement.expression.type === 'BinaryExpression') {
            expressionStatement.expression = convertBinaryExpression(expressionStatement.expression);
        } else if (expressionStatement.expression.type === 'UnaryExpression') {
            expressionStatement.expression = convertUnaryExpression(expressionStatement.expression);
        } else if (expressionStatement.expression.type === 'AssignmentExpression') {
            handleAssignmentExpression(expressionStatement.expression);
        } else if (expressionStatement.expression.type === 'ConditionalExpression') {
            handleConditionalExpression(expressionStatement.expression);
        } else if (expressionStatement.expression.type === 'SequenceExpression') {
            handleSequenceExpressions(expressionStatement.expression.expressions);
        } else if (expressionStatement.expression.type === 'LogicalExpression') {
            handleLogicalExpression(expressionStatement.expression);
        }
    }

    function handleFunctionDeclaration(functionDeclaration) {
        if (functionDeclaration.body && functionDeclaration.body.type === 'BlockStatement') {
            searchOperations(functionDeclaration.body.body);
        }
    }

    function replaceOperations(body) {
        searchOperations(body);
    }

    function findExpressionStatementsWithAssignmentExpressions(body) {

        var i, len = body.length;
        var j, jLen;
        for(i = 0; i < len; i += 1) {
            if (body[i].type === 'ExpressionStatement') {
                if (body[i].expression.type === 'CallExpression') {
                    jLen = body[i].expression.arguments.length;
                    for (j = 0; j < jLen; j += 1) {
                        if(body[i].expression.arguments[j].type === 'AssignmentExpression') {
                            body[i].expression.arguments[j] = body[i].expression.arguments[j].right;
                        }
                    } 
                } else if (body[i].expression.type === 'AssignmentExpression') {
                    handleAssignmentExpression(body[i].expression);
                } else if (body[i].expression.type === 'LogicalExpression') {
                    handleLogicalExpression(body[i].expression);
                }
            } else if (body[i].type === 'FunctionDeclaration') {
                if (body[i].body && body[i].body.type === 'BlockStatement') {
                    findExpressionStatementsWithAssignmentExpressions(body[i].body.body);
                }
            }
        }
    }

    function expressionIsValue(expression) {
        if(expression === 'value') {
            return true;
        }
        return false;
    }

    function expressionIsConstant(expressionTree) {
        if(expressionTree.body.length === 1  && expressionTree.body[0].type === "ExpressionStatement") {
            if (expressionTree.body[0].expression) {
                if(expressionTree.body[0].expression.type === "ArrayExpression") {
                    var i = 0, len = expressionTree.body[0].expression.elements.length;
                    while(i < len) {
                        if(expressionTree.body[0].expression.elements[i].type !== 'Literal') {
                            return false;
                        }
                        i += 1;
                    }
                    return true;
                } else if(expressionTree.body[0].expression.type === "Literal") {
                    return true;
                }
            }
        }
        return false;
    }

    function buildStaticValue(expression, returnOb) {
        returnOb.a = 0;
        returnOb.k = eval(expression)
    }

    /*function separateBodyDeclaredFunctions(body) {
        var i, len = body.length;
        separate_functions.bodies.length = 0;
        separate_functions.names.length = 0;
        for(i = 0; i < len; i += 1) {
            if (body[i].type === 'FunctionDeclaration') {
                separate_functions.names.push(body[i].id.name);
                separate_functions.bodies.push(body[i]);
                body.splice(i,1);
                i -= 1;
                len -= 1;
            }
        }
    }*/

    function checkExpression(prop, returnOb) {
        if (prop.expressionEnabled && !prop.expressionError) {
            if(expressionIsValue(prop.expression)) {
                return;
            }
            expressionStr = prop.expression;
            expressionStr = correctEaseAndWizz(expressionStr);
            expressionStr = correctKhanyu(expressionStr);
            expressionStr = correctElseToken(expressionStr);
            expressionStr = fixThrowExpression(expressionStr);
            expressionStr = renameNameProperty(expressionStr);

            expressionStr = variableDeclaration_helper.searchUndeclaredVariables(expressionStr);
            var parsed = esprima.parse(expressionStr, options);
            if(expressionIsConstant(parsed)) {
                buildStaticValue(expressionStr, returnOb);
                return;
            }
            var body = parsed.body;
            // TODO this needs more work. 
            // Global declared variables are not accessible to functions and should be.
            // Methods invoked from within an array need to be renamed
            //separateBodyDeclaredFunctions(body);
            findExpressionStatementsWithAssignmentExpressions(body);
            findExpressionStatementsWithAssignmentExpressions(separate_functions.bodies);
            if(expressionStr.indexOf("use javascript") === -1){
                replaceOperations(body);
                replaceOperations(separate_functions.bodies);
            }
            
            //Replacing reserved properties like position, anchorPoint with __transform.position,  __transform.anchorPoint
            reservedProperties_helper.replaceProperties(body);
            
            valueAssignment_helper.assignVariable(body);
            valueAssignment_helper.assignVariable(separate_functions.bodies);

            var escodegen = ob.escodegen;
            expressionStr = escodegen.generate(parsed);

            expressionStr = 'var $bm_rt;\n' + expressionStr;
            var generatedFunctions = [];
            var i, len = separate_functions.bodies.length;
            for(i = 0; i < len; i += 1) {
                generatedFunctions.push(escodegen.generate(separate_functions.bodies[i]));
            }
            returnOb.x = expressionStr;
            if(generatedFunctions.length) {
                returnOb.xf = generatedFunctions;
            }
        }
    }

    function renameNameProperty(str){
        var regName = /([.'"])name([\s'";.\)\]])/g;
        return str.replace(regName,'$1_name$2');
    }

    function correctElseToken(str){
        var regElse = / else /g;
        return str.replace(regElse,'\n else ');
    }

    function correctKhanyu(str){
        var easeRegex = /Khanyu\s[0-9. ]+/;
        if (easeRegex.test(str)) {
            str = str.replace('key(1)[1];', 'key(1)[1].length;');
            str = str.replace('key(1)[2];', 'key(1)[2].length;');
        }
        return str;
    }

    function correctEaseAndWizz(str){
        var easeRegex = /Ease and Wizz\s[0-9. ]+:/;
        if (easeRegex.test(str)) {
            str = str.replace('key(1)[1];', 'key(1)[1].length;');
            str = str.replace('key(1)[2];', 'key(1)[2].length;');
        }
        return str;
    }

    function fixThrowExpression(str){
        var throwRegex = /(throw (["'])(?:(?=(\\?))\3[\S\s])*?\2)\s*([^;])/g;
        return str.replace(throwRegex, '$1;\n$4');
    }

    ob.checkExpression = checkExpression;

    return ob;
}());