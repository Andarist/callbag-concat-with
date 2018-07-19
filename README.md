# callbag-concat-with

Callbag operator that emits items given it as arguments after it finishes emitting items emitted by source.

## Example

```js
import concatWith from 'callbag-concat-with'
import forEach from 'callbag-for-each'
import fromIter from 'callbag-from-iter'
import pipe from 'callbag-pipe'

pipe(
  fromIter([1, 2, 3]),
  concatWith(4, 5, 6),
  forEach(value => {
    console.log(value) // 1, 2, 3, 4, 5, 6
  }),
)
```
