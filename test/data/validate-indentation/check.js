if (a) {
  var b = c;
  var d = e
    * f;
    var e = f; // <-
// MISALIGNED COMMENT
  function g() {
    if (h) {
      var i = j;
      } // <-
    } // <-

  while (k) l++;
  while (m) {
  n--; // ->
    } // <-

  do {
    o = p +
  q; // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
    o = p +
    q;
    } while(r); // <-

  for (var s in t) {
    u++;
  }

    for (;;) { // <-
      v++; // <-
  }

  if ( w ) {
    x++;
  } else if (y) {
      z++; // <-
    aa++;
    } else { // <-
  bb++; // ->
} // ->
}

/**/var b; // NO ERROR: single line multi-line comments followed by code is OK
/*
 *
 */var b;

var arr = [
  a,
  b,
  c,
  function (){
    d
    }, // <-
  {},
  {
    a: b,
    c: d,
    d: e
  },
  [
    f,
    g,
    h,
    i
  ],
  [j]
];

var obj = {
  a: {
    b: {
      c: d,
      e: f,
      g: h +
    i // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
    }
  },
  g: [
    h,
    i,
    j,
    k
  ]
};

var arrObject = {a:[
  a,
  b, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
  c
]};

var objArray = [{
  a: b,
  b: c, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
  c: d
}];

var arrArray = [[
  a,
  b, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
  c
]];

var objObject = {a:{
  a: b,
  b: c, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
  c: d
}};


switch (a) {
  case 'a':
  var a = 'b'; // ->
    break;
  case 'b':
    var a = 'b';
    break;
  case 'c':
      var a = 'b'; // <-
    break;
  case 'd':
    var a = 'b';
  break; // ->
  case 'f':
    var a = 'b';
      break; // <-
  case 'g': {
    var a = 'b';
    break;
  }
  case 'z':
  default:
      break; // <-
}

switch (a) {
case 'a':
var a = 'b'; // ->
  break;
case 'b':
  var a = 'b';
  break;
case 'c':
    var a = 'b'; // <-
  break;
case 'd':
  var a = 'b';
break; // ->
case 'f':
  var a = 'b';
    break; // <-
case 'g': {
  var a = 'b';
  break;
}
case 'z':
default:
    break; // <-
}

a.b('hi')
   .c(a.b()) // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
   .d(); // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS

if ( a ) {
  if ( b ) {
d.e(f) // ->
  .g() // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
  .h(); // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS

    i.j(m)
      .k() // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
      .l(); // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS

      n.o(p) // <-
        .q() // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
        .r(); // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
  }
}

var a = b,
  c = function () {
  h = i; // ->
    j = k;
      l = m; // <-
  },
  e = {
    f: g,
    n: o,
    p: q
  },
  r = [
    s,
    t,
    u
  ];

var a = function () {
b = c; // ->
  d = e;
    f = g; // <-
};

function c(a, b) {
  if (a || (a &&
            b)) { // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
    return d;
  }
}

if ( a
  || b ) {
var x; // ->
  var c,
    d = function(a,
                  b) {
    a; // ->
      b;
        c; // <-
    }
}


a({
  d: 1
});

a(
1
);

a(
  b({
    d: 1
  })
);

a(
  b(
    c({
      d: 1,
      e: 1,
      f: 1
    })
  )
);

a({ d: 1 });

aa(
  b({ // NO ERROR: aligned with previous opening paren
    c: d,
    e: f,
    f: g
  })
);

aaaaaa(
  b,
  c,
  {
    d: a
  }
);

a(b, c,
  d, e,
    f, g  // NO ERROR: alignment of arguments of callExpression not checked
  );  // NO ERROR: this has nothing to do with indentation, this is CallExpression spacing

a(
  ); // NO ERROR: this has nothing to do with indentation, this is CallExpression spacing

aaaaaa(
  b,
  c, {
    d: a
  }, {
    e: f
  }
);

a.b()
  .c(function(){
    var a;
  }).d.e;

if (a == 'b') {
  if (c && d) e = f
  else g('h').i('j')
}

a = function (b, c) {
  return a(function () {
    var d = e
    var f = g
    var h = i

    if (!j) k('l', (m = n))
    if (o) p
    else if (q) r
  })
}

var a = function() {
  "b"
    .replace(/a/, "a")
    .replace(/bc?/, function(e) {
      return "b" + (e.f === 2 ? "c" : "f");
    })
    .replace(/d/, "d");
};

$(b)
  .on('a', 'b', function() { $(c).e('f'); })
  .on('g', 'h', function() { $(i).j('k'); });

a
  .b('c',
           'd'); // NO ERROR: this has nothing to do with indentation, this is CallExpression spacing

a
  .b('c', [ 'd', function(e) {
    e++;
  }]);

var a = function() {
      a++;
    b++; // <-
        c++; // <-
    },
    b;

var b = [
      a,
      b,
      c
    ],
    c;

var c = {
      a: 1,
      b: 2,
      c: 3
    },
    d;

var d = {
      a: 1,
      b: 2, // ->
      c: 3 // <-
    };

// holes in arrays indentation
[
 1,
 1,
 1,
 1,
 1,
 1,
 1,
 1,
 1,
 1,
];

try {
  a++;
    b++; // <-
c++; // ->
} catch (d) {
  e++;
    f++; // <-
g++; // ->
} finally {
  h++;
    i++; // <-
j++; // ->
}

if (array.some(function(){
  return true;
})) {
a++; // ->
  b++;
    c++; // <-
}

var a = b.c(function() {
      d++;
    }),
    e;

switch (true) {
  case (a
  && b):
case (c // ->
&& d):
    case (e // <-
    && f):
  case (g
&& h):
      var i = j; // <-
    var k = l;
  var m = n; // ->
}

if (a) {
  b();
}
else {
c(); // ->
  d();
    e(); // <-
}

if (a) b();
else {
c(); // ->
  d();
    e(); // <-
}

if (a) {
  b();
} else c();

if (a) {
  b();
}
else c();

a();

if( "very very long multi line" +
      "with weird indentation" ) {
  b();
a(); // ->
    c(); // <-
}

a( "very very long multi line" +
   "with weird indentation", function() {
  b();
a(); // ->
    c(); // <-
});

a =
    function(content, dom) {
  b();
    c(); // <-
d(); // ->
};

a =
    function(content, dom) {
      b();
        c(); // <-
    d(); // ->
    };

a =
    function(content, dom) {
    b(); // ->
    };

a =
    function(content, dom) {
b(); // ->
    };

a('This is a terribly long description youll ' +
  'have to read', function () {
  b();
  c();
});

if (
  array.some(function(){
    return true;
  })
) {
a++; // ->
  b++;
    c++; // <-
}

function c(d) {
  return {
    e: function(f, g) {
    }
  };
}

function a(b) {
  switch(x) {
    case 1:
      if (foo) {
        return 5;
      }
  }
}

function a(b) {
  switch(x) {
    case 1:
      c;
  }
}

function a(b) {
  switch(x) {
    case 1: c;
  }
}

function test() {
  var a = 1;
  {
    a();
  }
}

{
  a();
}

function a(b) {
  switch(x) {
    case 1:
        {
        a();
      }
      break;
    default:
      {
        b();
        }
  }
}

switch (a) {
  default:
    if (b)
      c();
}

function test(x) {
  switch (x) {
    case 1:
      return function() {
        var a = 5;
        return a;
      };
  }
}

switch (a) {
  default:
    if (b)
      c();
}

if (a) { function whatever() {
  b++;
  }
}

// Taken from https://github.com/jscs-dev/node-jscs/issues/857
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

do {
  nextop = peek(i);
  ++i;
} while (!_.contains(inof, nextop.value) && nextop.value !== ";" &&
    nextop.type !== "(end)");

a++;

if ( i < some )
{
  thing();
}
else
  other();

if (a) {
  b++;
}
  else if (d) {
  c++;
}
  else
{
  e++;
}

try {
  a++;
}
  catch(b)
{
  c++;
}
  finally
{
  d++;
}

var obj = {
  // correct
  prop: prop,
    // wrong
};

function comments() {
// error, because comment is above a checked line
  a++;
    // error, because comment is above a checked line (the comment below it)
// error, because comment is above a checked line
};

function blockComments() {
/**
 *  error, because comment is above a checked line
 */
  a++;
    /**
     * error, because comment is above a checked line
     */
}

if (c) {
  a++;
// no error because next line has a push and a pop
} else if (d) {

// error because next line has push but no pop
  if (e) {
    f++;
  }
}

switch (a) {
  case 'a':
    b++;
    /* falls through */
  case 'c':
    d++;
}

try { a++; }
  catch(b) { c++; }
  finally { d++; }

function blockComments() {
/**
 *  error, because comment is first token before a checked line
 */

  a++;
}

try {
  a++;
}
  finally
{
  d++;
}

var a = { a:b,
          c:d,
          e:f };

var g = {
a:b,
  c:d,
    e:f
  };

if (x)
    x++;
else
    x--;

for (;;)
    x++;

while (false)
    x++;

for (var j in {})
    j++;

for (var z of [])
    z++;

(function() {


  x++;


  y++;

})

try {
  a++;
// no error: aligning with catch
} catch (e) {
  e--;
// no error: aligning with finally
} finally {
  a--;
}

do {
  a++;
// no error: aligning with while
} while (false);
