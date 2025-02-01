//@formatter:off
// ZigZag encoding: https://lemire.me/blog/2022/11/25/making-all-your-integers-positive-with-zigzag-encoding/
const TYPES = ({
  // Numbers 0 to -121 do not need an identifier byte.
  ZERO:         0x00, // 0
  //            0x01  // -1
  //            0x02  // 1
  //            ...   // ZigZag encoded varints
  MAX:          0xF1, // -121; ZigZag encoded varint
  // F2 to F8 are reserved for special values.
  // All of these values are encoded with a single byte.
  NULL:         0xF2, // null
  TRUE:         0xF3, // true
  FALSE:        0xF4, // false
  EMPTY_OBJECT: 0xF5, // {}
  EMPTY_ARRAY:  0xF6, // []
  EMPTY_STRING: 0xF7, // ""
  // F8,F9 + data
  OBJECT:       0xF8, // {...}
  ARRAY:        0xF9, // [...]
  // FA,FB-FD + data
  INTEGER:      0xFA, // varint32 (ZigZag encoded)
  LONG:         0xFB, // varint64 (ZigZag encoded)
  FLOAT:        0xFC, // float32
  DOUBLE:       0xFD, // float64
  // FE,FF + length + data
  STRING:       0xFE, // string
  BINARY:       0xFF, // bytes
} as const);
//@formatter:on

export {
  TYPES
};
