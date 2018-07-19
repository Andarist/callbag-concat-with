export default function concatWith(...args) {
  return source => (start, sink) => {
    if (start !== 0) return

    let completed = false
    let unsubed = false

    source(0, (type, data) => {
      if (type === 0) {
        const talkback = data

        sink(0, (type, data) => {
          if (type === 2) {
            unsubed = true
            args.length = 0
          }

          if (completed) return

          talkback(type, data)
        })
        return
      }

      if (type === 2 && !data) {
        completed = true

        while (args.length !== 0) {
          sink(1, args.shift())
        }

        if (unsubed) return
      }

      sink(type, data)
    })
  }
}
