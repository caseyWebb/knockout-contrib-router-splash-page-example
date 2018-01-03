import * as ko from 'knockout'
import { Context } from '@profiscience/knockout-contrib-router'
import '@profiscience/knockout-contrib-observable-fn/increment'

const splashDuration = 5000
const start = Date.now()
let countdownInterval: NodeJS.Timer
let skipped = false

// hoist these so that if the user manually skips we can
// kill the sleep
let resolveTimeout: NodeJS.Timer
let resolve: () => void

function sleep(delay: number) {
  return new Promise((_resolve) => {
    resolve = () => {
      // ensure this only gets called once
      resolve = () => { /* noop */ }
      _resolve()
    }
    resolveTimeout = setTimeout(resolve, delay)
  })
}

export const hidden = ko.observable(false)
export const canContinue = ko.observable(false)
export const timeToContinue = ko.observable(0)

export function skip() {
  skipped = true
  clearInterval(countdownInterval)
  clearTimeout(resolveTimeout)
  hidden(true)
  resolve()
}

export function middleware(ctx: Context) {
  return {
    async afterRender() {
      // if this isn't the first run, bail
      if (skipped) return

      // the app is rendered under the splash page, so we can now allow the user to skip.
      canContinue(true)

      // display the splash for at least 5 seconds.
      // if 5000 - elapsed is negative, this will run immediately.
      //
      // so, if you are using async beforeRender middleware(s) elsewhere
      // and it resolves
      // - after 5 seconds, the splash will be hidden immediately after the app is rendered
      // - before 5 seconds, the splash will be hidden after the page has been loaded
      //   a TOTAL of 5 seconds. i.e. if the async beforeRender middleware takes 2 seconds
      //   this will wait for another 3 seconds to hide the splash page. This does not account
      //   for time before the JS is parsed and executed, so the 5s will not be exact.
      const elapsed = Date.now() - start
      const delay = splashDuration - elapsed

      timeToContinue(Math.ceil(delay / 1000))

      countdownInterval = setInterval(() => timeToContinue.decrement(), 1000)

      await sleep(delay)
      
      if (!skipped) {
        skip()
      }
    }
  }
}