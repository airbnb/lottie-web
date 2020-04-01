/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, esprima, escodegen*/

$.__bodymovin.bm_reserverPropertiesHelper = (function () {
    'use strict';
    var ob = {
        replaceProperties: replaceProperties
    };

    var reserved_properties = ['position', 'scale', 'anchorPoint', 'rotation']

    function Closure(body, declared_variables) {
        this.body = body;
        this.declared_variables = [].concat(declared_variables);
    }
    Closure.prototype.addDeclarations = function(declarations) {
        var i, len = declarations.length;
        var declaration;
        for (i = 0; i < len; i += 1) {
            declaration = declarations[i];
            this.declared_variables.push(declaration.id.name)
        }
    }

    function createClosure(body, declared_variables) {
        return new Closure(body, declared_variables);
    }

    function createFunctionClosure(element, declared_variables) {
        var i, len;
        var function_arguments = [];
        if (element.params) {
            len = element.params.length;
            for (i = 0; i < len; i += 1) {
                function_arguments.push(element.params[i].name);
            }
        }
        return new Closure(element.body, function_arguments.concat(declared_variables));
    }

    function arrayIndexOf(arr, value) {
        var i = 0, len = arr.length;
        while (i < len) {
            if(arr[i] === value) {
                return i;
            }
            i += 1;
        }
        return -1;
    }

    function processIdentifier(property, declared_variables) {
        var name = property.name;
        if (arrayIndexOf(reserved_properties, name) !== -1 && arrayIndexOf(declared_variables, name) === -1) {
            return createMemberExpression(property.name);
        }
        return property;
    }

    function createMemberExpression(name) {
        return {
            type: 'MemberExpression',
            object: {
                name: '$bm_transform',
                type: 'Identifier'
            },
            property: {
                name: name,
                type: 'Identifier'
            }
        }
    }

    function processArrayExpression(element, inner_closures, declared_variables) {
        processSequenceExpression(element.elements, inner_closures, declared_variables)
    }

    function processVariableDeclaration(element, inner_closures, declared_variables) {
        var declarations = element.declarations;
        var i, len = declarations.length;
        for(i = 0; i < len; i += 1) {
            if(declarations[i].init) {
                declarations[i].init = processGeneralExpression(declarations[i].init, inner_closures, declared_variables);
            }
        }
    }

    function processConditionalExpression(expression, inner_closures, declared_variables) {
        if(expression.test) {
            expression.test = processGeneralExpression(expression.test, inner_closures, declared_variables);
        }
        if(expression.consequent){
            expression.consequent = processGeneralExpression(expression.consequent, inner_closures, declared_variables);
        }
        if(expression.alternate){
            expression.alternate = processGeneralExpression(expression.alternate, inner_closures, declared_variables);
        }
    }

    function processFunctionExpression(expression, inner_closures, declared_variables) {
        if(expression.body && expression.body.type === 'BlockStatement') {
            inner_closures.push(new Closure(expression.body.body, declared_variables));
        }
    }

    function processCallExpression(expression, inner_closures, declared_variables) {
        if (expression.arguments) {
            iterateArguments(expression.arguments, inner_closures, declared_variables);
        }
        if(expression.callee && expression.callee.type === 'FunctionExpression') {
            processFunctionExpression(expression.callee, inner_closures, declared_variables);
        }
    }

    function processAssignmentExpression(expression, inner_closures, declared_variables) {
        if (expression.left) {
            if (expression.left.type === 'MemberExpression') {
                processMemberExpression(expression.left, inner_closures, declared_variables);
            }
        }
        if (expression.right) {
            expression.right = processGeneralExpression(expression.right, inner_closures, declared_variables);
        }
    }

    function processSequenceExpression(expressions, inner_closures, declared_variables) {
        var i, len = expressions.length;
        for (i = 0; i < len; i += 1) {
            expressions[i] = processGeneralExpression(expressions[i], inner_closures, declared_variables);
        }
    }

    function processMemberExpression(expression, inner_closures, declared_variables) {
        if (expression.object.type === 'Identifier') {
            expression.object = processIdentifier(expression.object, declared_variables);
        }

        if (expression.property && expression.computed) {
            expression.property = processGeneralExpression(expression.property, inner_closures, declared_variables)
        }
    }

    function processBinaryExpression(expression, inner_closures, declared_variables) {
        if(expression.test) {
            expression.test = processGeneralExpression(expression.test, inner_closures, declared_variables);
        }
        if(expression.left) {
            expression.left = processGeneralExpression(expression.left, inner_closures, declared_variables);
        }
        if(expression.right) {
            expression.right = processGeneralExpression(expression.right, inner_closures, declared_variables);
        }
    }

    function processUnaryExpression(element, inner_closures, declared_variables) {
        if(element.argument) {
            element.argument = processGeneralExpression(element.argument, inner_closures, declared_variables);
        }
    }

    function processLogicalExpression(test, inner_closures, declared_variables) {
        if (test.left) {
            test.left = processGeneralExpression(test.left, inner_closures, declared_variables);
        }

        if (test.right) {
            test.right = processGeneralExpression(test.right, inner_closures, declared_variables);
        }
    }

    function processIfStatement(element, inner_closures, declared_variables) {
        if(element.test) {
            if(element.test.type === 'LogicalExpression') {
                processLogicalExpression(element.test, inner_closures, declared_variables)
            } else if(element.test.type === 'BinaryExpression') {
                processBinaryExpression(element.test, inner_closures, declared_variables)
            }
        }
        if (element.consequent) {
            if (element.consequent.type === 'BlockStatement') {
                inner_closures.push(new Closure(element.consequent.body, declared_variables));
            } else if (element.consequent.type === 'IfStatement') {
                processIfStatement(element.consequent, inner_closures, declared_variables)
            } else if (element.consequent.type === 'ReturnStatement') {
                processReturnStatement(element.consequent, inner_closures, declared_variables)
            } else if (element.consequent.type === 'ExpressionStatement') {
                element.consequent = processGeneralExpression(element.consequent, inner_closures, declared_variables);
            } else {
                //console.log(element.consequent.type)
            }
        }
        if (element.alternate) {
            if (element.alternate.type === 'BlockStatement') {
                inner_closures.push(new Closure(element.alternate.body, declared_variables));
            } else if (element.alternate.type === 'IfStatement') {
                processIfStatement(element.alternate, inner_closures, declared_variables);
            } else if (element.alternate.type === 'ReturnStatement') {
                processReturnStatement(element.alternate, inner_closures, declared_variables);
            } else if (element.alternate.type === 'ExpressionStatement') {
                element.alternate = processGeneralExpression(element.alternate, inner_closures, declared_variables);
            } else {
                // console.log(element.consequent.type)
            }
        }
    }

    function processTryStatement(element, inner_closures, declared_variables) {
        if(element.block) {
            if(element.block.type === 'BlockStatement') {
                inner_closures.push(new Closure(element.block.body, declared_variables));
            }
        }
        if(element.handler) {
            if(element.handler && element.handler.body && element.handler.body.type === 'BlockStatement') {
                inner_closures.push(new Closure(element.handler.body.body, declared_variables));
            }
        }
    }

    function processSwitchConsequents(consequents, inner_closures, declared_variables) {
        var i, len = consequents.length;
        for(i = 0; i < len; i += 1) {
            if (consequents[i].type === 'BlockStatement') {
                inner_closures.push(new Closure(consequents[i].body, declared_variables));
            } else {
                consequents[i] = processGeneralExpression(consequents[i], inner_closures, declared_variables);
            }
        }
    }

    function processSwitchStatement(element, inner_closures, declared_variables) {
        if(element.discriminant) {
            element.discriminant = processGeneralExpression(element.discriminant, inner_closures, declared_variables);
        }
        if(element.cases) {
            var i, len = element.cases.length;
            for (i = 0; i < len; i += 1) {
                if(element.cases[i].test) {
                    element.cases[i].test = processGeneralExpression(element.cases[i].test, inner_closures, declared_variables);
                }
                if(element.cases[i].consequent) {
                    processSwitchConsequents(element.cases[i].consequent, inner_closures, declared_variables);
                }
            }
        }
    }

    function processWhileStatement(element, inner_closures, declared_variables) {
        if(element.test) {
            element.test = processGeneralExpression(element.test, inner_closures, declared_variables);
        }
        if(element.body) {
            if(element.body.type === 'BlockStatement') {
                inner_closures.push(new Closure(element.body.body, declared_variables));
            }
        }
    }

    function iterateArguments(expression_arguments, inner_closures, declared_variables) {
        var i, len = expression_arguments.length;
        for (i = 0; i < len; i += 1) {
            expression_arguments[i] = processGeneralExpression(expression_arguments[i], inner_closures, declared_variables);
        }
    }

    function processReturnStatement(element, inner_closures, declared_variables) {
        if (element.argument) {
            if(element.argument.type === 'CallExpression') {
                if(element.argument.callee.body) {
                    inner_closures.push(new Closure(element.argument.callee.body, declared_variables));
                } else {
                    processCallExpression(element.argument, inner_closures, declared_variables);
                }
            } else if(element.argument.type === 'FunctionExpression' && element.argument.body) {
                if(element.argument.body.type === 'BlockStatement') {
                    inner_closures.push(new Closure(element.argument.body.body, declared_variables));
                }
            } else {
                element.argument = processGeneralExpression(element.argument, inner_closures, declared_variables);
            }
        }
    }

    function processGeneralExpression(expression, inner_closures, declared_variables) {
        if (expression.type === 'CallExpression') {
            processCallExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'AssignmentExpression') {
            processAssignmentExpression(expression, inner_closures, declared_variables)
        } else if (expression.type === 'ConditionalExpression') {
            processConditionalExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'MemberExpression') {
            processMemberExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'ArrayExpression') {
            processArrayExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'LogicalExpression') {
            processLogicalExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'BinaryExpression') {
            processBinaryExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'UnaryExpression') {
            processUnaryExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'FunctionExpression') {
            processFunctionExpression(expression, inner_closures, declared_variables);
        } else if (expression.type === 'SequenceExpression') {
            processSequenceExpression(expression.expressions, inner_closures, declared_variables);
        } else if (expression.type === 'Identifier') {
            expression = processIdentifier(expression, declared_variables);
        } else if (expression.type === 'Literal') {
            expression = processIdentifier(expression, declared_variables);
        } else if (expression.type === 'ExpressionStatement') {
            expression.expression = processGeneralExpression(expression.expression, inner_closures, declared_variables)
        } else {
            // console.log(expression.type)
        }
        return expression;
    }

    function iterateBody(closure) {
        var body = closure.body
        var declared_variables = closure.declared_variables;
        var i, len = body.length
        var inner_closures = [];
        var element;
        // First loop finds declarations and closures
        for (i = 0; i < len; i += 1) {
            element = body[i];
            if (element.type === 'VariableDeclaration') {
                closure.addDeclarations(element.declarations);
            }
        }
        // Second loop process expressions
        for (i = 0; i < len; i += 1) {
            element = body[i];
            if (element.type === 'VariableDeclaration') {
                processVariableDeclaration(element, inner_closures, declared_variables);
            } else if (element.type === 'FunctionDeclaration') {
                if (element.body && element.body.type === 'BlockStatement') {
                    inner_closures.push(createFunctionClosure(element.body, declared_variables));
                }
            } else if (element.type === 'ReturnStatement') {
                processReturnStatement(element, inner_closures, declared_variables);
            } else if (element.type === 'ExpressionStatement') {
                element.expression = processGeneralExpression(element.expression, inner_closures, declared_variables);
            } else if (element.type === 'IfStatement') {
                processIfStatement(element, inner_closures, declared_variables);
            } else if (element.type === 'TryStatement') {
                processTryStatement(element, inner_closures, declared_variables);
            } else if (element.type === 'SwitchStatement') {
                processSwitchStatement(element, inner_closures, declared_variables);
            } else if (element.type === 'WhileStatement') {
                processWhileStatement(element, inner_closures, declared_variables);
            } else {
                // console.log(element.type)
            }
        }

        iterateInnerClosures(inner_closures, closure.declared_variables);
    }

    function iterateInnerClosures(closures) {
        var i, len = closures.length;
        for(i = 0; i < len; i += 1) {
            iterateBody(closures[i]);
        }
    }

    function replaceProperties(body) {
        var closure = createClosure(body, []);
        iterateBody(closure)
    }

    return ob;
}())