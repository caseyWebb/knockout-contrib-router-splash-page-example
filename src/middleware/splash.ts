import * as ko from 'knockout'
import { Context } from '@profiscience/knockout-contrib-router'
import '@profiscience/knockout-contrib-observable-fn/increment'

class SplashViewModel {
  private splashDuration = 5000
  private start = Date.now()
  private resumeFromSleep: () => void
  
  public dismissed = false
  public hidden = ko.observable(false)
  public canDismiss = ko.observable(false)
  public dismissCountdown = ko.observable(0)

  public dismiss() {
    this.dismissed = true
    this.hidden(true)
    this.resumeFromSleep()
  }

  /**
  * display the splash for at least 5 seconds.
  * if 5000 - elapsed is negative, this will run immediately.
  *
  * so, if you are using async beforeRender middleware(s) elsewhere
  * and it resolves
  * - after 5 seconds, the splash will be hidden immediately after the app is rendered
  * - before 5 seconds, the splash will be hidden after the page has been loaded
  *   a TOTAL of 5 seconds. i.e. if the async beforeRender middleware takes 2 seconds
  *   this will wait for another 3 seconds to hide the splash page. This does not account
  *   for time before the JS is parsed and executed, so the 5s will not be exact.
  */
  public async countdown() {
    const elapsed = Date.now() - this.start
    const delay = this.splashDuration - elapsed

    this.dismissCountdown(Math.ceil(delay / 1000))

    const countdownInterval = setInterval(() => this.dismissCountdown.decrement(), 1000)

    await this.sleep(delay)

    clearInterval(countdownInterval)
  }

  private sleep(delay: number) {
    return new Promise((_resolve) => {
      this.resumeFromSleep = () => {
        // ensure this only gets called once when the splash page times out
        this.resumeFromSleep = () => { /* noop */ }
        clearTimeout(sleepTimeout)
        _resolve()
      }
      const sleepTimeout = setTimeout(this.resumeFromSleep, delay)
    })
  }
}

const splashVM = new SplashViewModel()

ko.components.register('splash', {
  viewModel: {
    instance: splashVM
  },
  template: {
    element: document.getElementsByTagName('splash')[0]
  }
})

export function splashScreenMiddleware(ctx: Context) {
  return {
    async afterRender() {
      // if this isn't the first run, bail
      if (splashVM.dismissed) return

      // the app is rendered under the splash page, so we can now allow the user to skip.
      splashVM.canDismiss(true)
      
      await splashVM.countdown()

      if (!splashVM.dismissed) {
        splashVM.dismiss()
      }
    }
  }
}