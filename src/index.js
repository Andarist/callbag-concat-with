import concat from 'callbag-concat'
import of from 'callbag-of'

export default function concatWith(...args) {
  return source => concat(source, of(...args))
}
