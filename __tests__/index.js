import forEach from 'callbag-for-each'
import fromIter from 'callbag-from-iter'
import interval from 'callbag-interval'
import mock from 'callbag-mock'
import pipe from 'callbag-pipe'
import subject from 'callbag-subject'
import take from 'callbag-take'
import tap from 'callbag-tap'
import tapUp from 'callbag-tap-up'

import concatWith from '../src'

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const noop = () => {}
const autoPull = noop

test('works with listenables', () => {
  const actual = []

  pipe(
    interval(30),
    take(4),
    concatWith(4),
    forEach(value => {
      actual.push(value)
    }),
  )

  return delay(140).then(() => {
    expect(actual).toEqual([0, 1, 2, 3, 4])
  })
})

test('works with pullables', () => {
  const actual = []

  pipe(
    fromIter([1, 2, 3]),
    concatWith(4),
    forEach(value => {
      actual.push(value)
    }),
  )

  expect(actual).toEqual([1, 2, 3, 4])
})

test('works with multiple arguments', () => {
  const actual = []

  pipe(
    fromIter([1, 2, 3]),
    concatWith(4, 5, 6),
    forEach(value => {
      actual.push(value)
    }),
  )

  expect(actual).toEqual([1, 2, 3, 4, 5, 6])
})

test('should not end with given value if source errors', () => {
  const actual = []

  const source = subject()

  pipe(
    source,
    concatWith(4),
    forEach(value => {
      actual.push(value)
    }),
  )

  source(1, 1)
  source(1, 2)
  source(1, 3)
  source(2, 'err')

  expect(actual).toEqual([1, 2, 3])
})

test('should pass requests, terminations (& unknown types) up', () => {
  const history = []

  const reportSource = (type, data) => {
    if (type === 0) return
    history.push([type, data])
  }

  const source = mock(reportSource, true)
  const sink = mock()

  pipe(
    source,
    concatWith(4),
    src => src(0, sink),
  )

  sink.emit(1, 'arg')
  sink.emit(11, 'unknown')
  sink.emit(2, 'err')

  expect(history).toEqual([[1, 'arg'], [11, 'unknown'], [2, 'err']])
})

test('should stop passing things up after source completes', done => {
  const actual = []
  let completed = false

  const failAfterCompletion = () => {
    if (!completed) return
    done.fail(
      'Nothing should be emitted back to the source after the source completes.',
    )
  }

  pipe(
    fromIter([1, 2, 3]),
    tap(noop, noop, () => {
      completed = true
    }),
    tapUp(failAfterCompletion, failAfterCompletion, failAfterCompletion),
    concatWith(4, 5, 6, 7, 8, 9),
    forEach(value => {
      actual.push(value)
    }),
  )

  expect(actual).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  done()
})

test('should not emit given values after sink unsubscribes', () => {
  const actual = []

  pipe(
    fromIter([1, 2, 3]),
    concatWith(4, 5, 6),
    take(2),
    forEach(value => {
      actual.push(value)
    }),
  )

  expect(actual).toEqual([1, 2])
})

test('should stop emitting given values after sink unsubscribes', () => {
  const actual = []

  pipe(
    fromIter([1, 2, 3]),
    concatWith(4, 5, 6),
    tap(value => {
      actual.push(value)
    }),
    take(4),
    forEach(autoPull),
  )

  expect(actual).toEqual([1, 2, 3, 4])
})
