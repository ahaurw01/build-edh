const EVENTS = {
  addCard: {
    check: e => e.key === 'p' && (e.metaKey || e.ctrlKey),
    preventDefault: true,
  },
}

export default class Presser {
  constructor() {
    this.target = document.createElement('div')
    document.addEventListener('keydown', this.handleKeyDown)
  }

  on(event, fn) {
    this.target.addEventListener(event, fn)
  }

  off() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = e => {
    for (let event in EVENTS) {
      if (EVENTS[event].check(e)) {
        EVENTS[event].preventDefault && e.preventDefault()
        this.target.dispatchEvent(new Event(event))
        return
      }
    }
  }

  // Used for testing - manually fire an event.
  _emit = event => this.target.dispatchEvent(new Event(event))
}
