if (a) {
  var b = c;
  var d = e
    * f;
    var e = f; // <-
// NO ERROR: DON'T VALIDATE EMPTY OR COMMENT ONLY LINES
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

/**/ var b; // NO ERROR: single line multi-line comments followed by code is OK
/*
 *
 */ var b; // ERROR: multi-line comments followed by code is not OK

var arr = [
  a,
    b, // <-
c, // ->
  function (){
    d
    }, // <-
  {},
  {
    a: b,
      c: d, // <-
  d: e // ->
  },
  [
    f,
    g,
      h, // <-
  i // ->
  ],
  [j]
];

var obj = {
  a: {
      b: { // <-
      c: d,
    e: f, // ->
      g: h +
    i // NO ERROR: DON'T VALIDATE MULTILINE STATEMENTS
  } // ->
  },
  g: [
    h,
    i,
      j, // <-
  k // ->
  ]
};

var arrObject = {a:[
    a, // <-
  b, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
c // ->
]};

var objArray = [{
    a: b, // <-
  b: c, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
c: d // ->
}];

var arrArray = [[
    a, // <-
  b, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
c // ->
]];

var objObject = {a:{
    a: b, // <-
  b: c, // NO ERROR: INDENT ONCE WHEN MULTIPLE INDENTED EXPRESSIONS ARE ON SAME LINE
c: d // ->
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
  f: g, // ->
    n: o,
      p: q // <-
  },
  r = [
  s, // ->
    t,
      u // <-
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
    e: 1,    // ->
        f: 1 // <-
    })
  )
);

a({ d: 1 });

aa(
   b({ // NO ERROR: aligned with previous opening paren
     c: d,
       e: f,  // <-
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
    f, g  // <-
  );  // <-

a(
  ); // <-
