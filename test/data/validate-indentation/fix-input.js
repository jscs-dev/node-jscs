if (a) {
/*
123
*/
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

  if (g) {
      /**
       * DOCBLOCK

       */
      var a = b +
          c;

/**
 * DOCBLOCK

 */
    var e = f + g;

  }
    else if(c) {
  d++;
}

var Detector = {
  webgl: ( function () { try { a++; } catch( e ) { return false; } } )(),
  workers: !! window.Worker
};

  for ( i = 0; i < len; i++ )
  {
    a++;
  }
