// Names.
var SOME_CONSTANT = 1;
var foo = new Foo();

// Multiple var declaration.
function testVars() {
    var keys = ['foo', 'bar'];
    var values = [23, 42];

    var object = {};
    while (keys.length) {
        var key = keys.pop();
        object[key] = values.pop();
    }
}

// Disallow spaces before and after curly braces.
var obj = {a: 1, b: 2, c: 3};
var nestedObj = {a: {b: 1}};

// Disallow space before object keys.
var obj = {
    prop: 0
};

// Disallow alignment in object literals.
var obj = {
    a: 0,
    b: 1,
    lengthyName: 2
};

// Disallow quoted keys in object if possible.
var obj = {
    key: 0,
    'key-key': 1
};

// Disallow spaces before and after square brackets.
var fellowship = ['foo', 'bar', 'baz'];
var nestedArr = [1, [2, 3]];

// String should have single quotes.
var lyrics = 'Never gonna give you up, Never gonna let you down';
var test = 'It shouldn\'t fail';

// Use spaces after all keywords
if (test) {
    doSomething();
}

function foo() {
    doSomething();
}

var bar = function () {
    doSomething();
};

// No space after return
function test() {
    return;
}

// if-else
if (condition) {
    actionIfTrue();
} else {
    actionIfFalse();
}

// Long conditions
if (longCondition ||
    anotherLongCondition &&
    yetAnotherLongCondition
) {
    doSomething();
}

// No yoda conditions.
if (getType() === 'driving') {
    doSomething();
}

// Switch
switch (value) {
    case 1:
        // ...
        break;

    case 2:
        // ...
        break;

    default:
        // ...
        // no break keyword on the last case
        doSomething();
}

// Ternary operators.
var x = a ? b : c;

var y = a ?
    longButSimpleOperandB : longButSimpleOperandC;

var z = a ?
    moreComplicatedB :
    moreComplicatedC;

// No space with unary operators.
var foo = !bar;

// Use explicit type conversions.
Boolean(foo);
Number(bar);
String(baz);
[].indexOf(qux) === -1;
[].indexOf(qux) < 0;

// Require parentheses around IIFE
(function () {

}());

// Long lines
var debt = this.calculateBaseDebt() + this.calculateSharedDebt() + this.calculateDebtPayments() +
    this.calculateDebtFine();

// this and closures
doAsync(function () {
    this.fn();
}.bind(this));

var _this = this;
doAsync(function () {
    _this.fn();
});

[1, 2, 3].forEach(function (n) {
    this.fn(n);
}, this);

// Comments with url can have maximum line length > 120 ................... https://github.com/yandex/codestyle/blob/master/js.md

/**
 * Test jsdoc validation.
 *
 * @param {String} message
 * @param {Number|Object} line
 * @param {Number} [column]
 */
var add = function (message, line, column) {};

// requireSpaceBetweenArguments
console.log(1, 2);
