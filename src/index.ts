import { Source } from 'callbag'
import concat from 'callbag-concat'
import of from 'callbag-of'

export default function concatWith<T extends any[], I>(...args: T) {
  return (source: Source<I>) => concat(source, of(...args))
}
