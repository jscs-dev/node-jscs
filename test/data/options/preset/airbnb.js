// requireSpacesInsideImportedObjectBraces
import { join, resolve } from 'path';

// requireParenthesesAroundIIFE
(function (window) {
  <Foo
    superLongParam="bar"
    anotherSuperLongParam="baz"
  />;

  // requireDollarBeforejQueryAssignment
  var $div = $('.container');

  // validateIndentation: 2
  'use strict';

  // requirePaddingNewLinesBeforeLineComments
  // requireCurlyBraces
  // requireSpaceBeforeBlockStatements
  do {
    // disallowSpacesInsideParentheses
    console.log('foo');
  } while (true);

  // "disallowMultipleVarDecl": true
  // requireCommaBeforeLineBreak
  // requirePaddingNewLinesAfterBlocks
  var x = 1;

  // requireSpacesInConditionalExpression
  var y = x ? x : null;

  // requireTrailingComma
  var z = [
    1,
  ];

  // disallowSpacesInsideArrayBrackets
  // requireTrailingComma - { "ignoreSingleLine": true },
  var z = [1];

  // requireSpaceAfterKeywords
  if (1) console.log('foo');

  // requireBlocksOnNewline
  // disallowKeywordsOnNewLine: ["else"]
  if (1) {
    console.log('bar');
  } else {
    console.log('foobar');
    console.log('bar');

    // disallowSpaceAfterPrefixUnaryOperators
    ++x;

    // disallowSpaceBeforePostfixUnaryOperators
    x++;

    // requireSpaceBeforeBinaryOperators
    // requireSpaceAfterBinaryOperators
    z[0] = x + y;
  }

  // disallowSpacesInFunctionDeclaration
  function foo() {
    var api = {
      // disallowQuotedKeysInObjects
      // disallowSpaceAfterObjectKeys
      foo: function () {
        // safeContextKeyword
        var _this = this;

        // disallowDanglingUnderscores: false
        // validateQuoteMarks: ''
        var _priv = 'yo';

        // disallowEmptyBlocks
        return function () {
          // requireSpaceBetweenArguments
          console.log('bar', 'foo');
        };
      },

      // requireCamelCaseOrUpperCaseIdentifiers
      mySweetProp: true,
    };

    return api;
  }

  // https://github.com/airbnb/javascript#7.11
  (function () {
    const x = function () {};

    const y = function a() {};
  })();

  // requireCapitalizedConstructors
  function Bar() {}

  // https://github.com/airbnb/javascript

  (function () {
    const foo = 1;
    let bar = foo;

    bar = 9;
  })();

  (function () {
    const foo = [1, 2];
    const bar = foo;

    bar[0] = 9;
  })();

  (function () {
    function getKey(k) {
      return `a key named ${k}`;
    }

    const obj = {
      id: 5,
      name: 'San Francisco',
      [getKey('enabled')]: true,
    };
  })();

  (function () {
    const atom = {
      value: 1,

      addValue(value) {
        return atom.value + value;
      },
    };
  })();

  (function () {
    const lukeSkywalker = 'Luke Skywalker';

    const obj = {
      lukeSkywalker,
    };
  })();

  (function () {
    const anakinSkywalker = 'Anakin Skywalker';
    const lukeSkywalker = 'Luke Skywalker';

    const obj = {
      lukeSkywalker,
      anakinSkywalker,
      episodeOne: 1,
      twoJedisWalkIntoACantina: 2,
      episodeThree: 3,
      mayTheFourth: 4,
    };
  })();

  (function () {
    const someStack = [];
    someStack.push('abracadabra');
  })();

  (function () {
    const items = [1, 2, 3];
    const itemsCopy = [...items];
  })();

  (function () {
    function getFullName(obj) {
      const { firstName, lastName } = obj;
      return `${firstName} ${lastName}`;
    }
  })();

  (function () {
    function getFullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    }
  })();

  (function () {
    const arr = [1, 2, 3, 4];
    const [first, second] = arr;
  })();

  (function () {
    // good
    function processInput(input) {
      // then a miracle occurs
      return { left, right, top, bottom };
    }

    // the caller selects only the data they need
    const { left, right } = processInput(input);
  })();

  (function () {
    const errorMessage = 'This is a super long error that was thrown because ' +
      'of Batman. When you stop to think about how Batman had anything to do ' +
      'with this, you would get nowhere fast.';
  })();

  (function () {
    let test;
    if (currentUser) {
      test = () => {
        console.log('Yup.');
      };
    }
  })();

  (function () {
    function concatenateAll(...args) {
      return args.join('');
    }
  })();

  (function () {
    [1, 2, 3].map(x => x * x);
  })();

  (function () {
    // good
    [1, 2, 3].map(x => x * x);

    // good
    [1, 2, 3].reduce((total, n) => total + n, 0);
  })();

  (function () {
    class Queue {
      constructor(contents = []) {
        this._queue = [...contents];
      }

      pop() {
        const value = this._queue[0];
        this._queue.splice(0, 1);
        return value;
      }
    }
    class PeekableQueue extends Queue {
      peek() {
        return this._queue[0];
      }
    }
  })();

  (function () {
    class Jedi {
      jump() {
        this.jumping = true;
        return this;
      }

      setHeight(height) {
        this.height = height;
        return this;
      }
    }

    const luke = new Jedi();

    luke.jump()
      .setHeight(20);
  })();

  (function () {
    class Jedi {
      contructor(options = {}) {
        this.name = options.name || 'no name';
      }

      getName() {
        return this.name;
      }

      toString() {
        return `Jedi - ${this.getName()}`;
      }
    }
  })();

  (function () {
    // good
    let sum = 0;
    numbers.forEach((num) => sum += num);
    sum === 15;

    // best (use the functional force)
    const sum = numbers.reduce((total, num) => total + num, 0);
    sum === 15;
  })();

  (function () {
    const goSportsTeam = true;
    const items = getItems();
    let dragonball;
    let i;
    let length;
  })();

  (function () {
    $('#items')
      .find('.selected')
        .highlight()
        .end()
      .find('.open')
        .updateCount();
  })();

  (function () {
    const leds = stage.selectAll('.led')
        .data(data)
      .enter().append('svg:svg')
        .classed('led', true)
        .attr('width', (radius + margin) * 2)
      .append('svg:g')
        .attr('transform', 'translate(' + (radius + margin) + ',' + (radius + margin) + ')')
        .call(tron.led);
  })();

  // https://github.com/airbnb/javascript#18.6
  (function () {
    if (foo) {
      return bar;
    }

    return baz;
  })();

  (function () {
    const obj = {
      foo() {
      },

      bar() {
      },
    };
  })();

  (function () {
    const arr = [
      function foo() {
      },

      function bar() {
      },
    ];

    return arr;
  })();

  (function () {
    const story = [
      once,
      upon,
      aTime,
    ];
    const hero = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      birthYear: 1815,
      superPower: 'computers',
    };
  })();

  (function () {
    const totalScore = String(this.reviewScore);
    const inputValue = '4';
    const val = Number(inputValue);
    const val = parseInt(inputValue, 10);
    /**
     * parseInt was the reason my code was slow.
     * Bitshifting the String to coerce it to a
     * Number made it a lot faster.
     */
    const val = inputValue >> 0;

    const age = 0;
    const hasAge = Boolean(age);
    const hasAge = !!age;
  })();

  (function () {
    const thisIsMyObject = {};
    function thisIsMyFunction() {}

    class User {
      constructor(options) {
        this.name = options.name;
      }
    }

    const good = new User({
      name: 'yup',
    });
  })();

  (function () {
    function foo() {
      return () => {
        console.log(this);
      };
    }
  })();

  (function () {
  })();

  //disallowArrayDestructuringReturn
  //https://github.com/airbnb/javascript#5.3
  (function () {
    function processInput(input) {
      const left = 1;
      const right = 2;
      const top = 3;
      const bottom = 4;

      return { left, right, top, bottom };
    }
  })();

  // requireShorthandArrowFunctions
  // https://github.com/airbnb/javascript#8.2
  (function () {
    [1, 2, 3].map(number => number * 2);
  })();

  (function () {
    [1, 2, 3].map((number) => {
      const nextNumber = number + 1;
      return `A string containing the ${nextNumber}.`;
    });
  });
})(window);
