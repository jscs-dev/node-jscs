// Use single quotes, unless you are writing JSON.
var foo = 'bar';

// Your opening braces go on the same line as the statement.
// Also, notice the use of whitespace
// before and after the condition statement.
if (true) {
  console.log('winning');
}

// One method per line should be used if you want to chain methods.
// You should also indent these methods so it's easier to tell
// they are part of the same chain.
User
  .findOne({ name: 'foo' })
  .populate('bar')
  .exec(function(err, user) {
    return true;
  });

// Declare one variable per var statement,
// it makes it easier to re-order the lines.
var keys   = ['foo', 'bar'];
var values = [23, 42];

var object = {};
while (keys.length) {
  var key = keys.pop();
  object[key] = values.pop();
}

// Use lowerCamelCase for variables, properties and function names
// Single character variables and uncommon abbreviations should
// generally be avoided.
var adminUser = db.query('SELECT * FROM users ...');

// Use UpperCamelCase for class names
function BankAccount() {
}

// Use UPPERCASE for Constants
var SECOND = 1 * 1000;

function File() {
}
File.FULL_PERMISSIONS = 0777;

// Use trailing commas and put short declarations on a single line.
// Only quote keys when your interpreter complains:
var a = ['hello', 'world'];
var b = {
  good: 'code',
  'is generally': 'pretty',
};

// Use the === operator
var a = 0;
if (a !== '') {
  console.log('winning');
}

// Use multi-line ternary operator
var foo = (a === b)
  ? 1
  : 2;

// Do not extend built-in prototypes
var a = [];
if (!a.length) {
  console.log('winning');
}

// Use descriptive conditions
var isValidPassword = password.length >= 4 && /^(?=.*\d).{4,}$/.test(password);

if (isValidPassword) {
  console.log('winning');
}

// Write small functions

// Return early from functions
function isPercentage(val) {
  if (val < 0) {
    return false;
  }

  if (val > 100) {
    return false;
  }

  return true;
}

// Shows else statement being used
if (val < 100) {
  true;
} else {
  false;
}

function isPercentage(val) {
  var isInRange = (val >= 0 && val <= 100);
  return isInRange;
}

// Name your closures
req.on('end', function onEnd() {
  console.log('winning');
});

// No nested closures
setTimeout(function() {
  client.connect(afterConnect);
}, 1000);

function afterConnect() {
  console.log('winning');
}

// Use slashes for comments
// 'ID_SOMETHING=VALUE' -> ['ID_SOMETHING=VALUE', 'SOMETHING', 'VALUE']
var matches = item.match(/ID_([^\n]+)=([^\n]+)/);

// This function has a nasty side effect where a failure to increment a
// redis counter used for statistics will cause an exception. This needs
// to be fixed in a later iteration.
function loadUser(id, cb) {
  // ...
}

var isSessionValid = (session.expires < Date.now());
if (isSessionValid) {
  // ...
}
