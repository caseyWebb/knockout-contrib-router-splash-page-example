import * as $ from 'jquery'
import * as ko from 'knockout'
import { Context, Router } from '@profiscience/knockout-contrib-router'

const splashHidden = ko.observable(false)
const start = Date.now() // this will be set as soon as the JS is executed

ko.components.register('app', {
  template: '<router></router>'
})

ko.components.register('home', {
  template: '<h1>Home</h1>'
})

function splashPageMiddleware(ctx: Context) {
  return {
    afterRender() {
      // if this isn't the first run, bail
      if (splashHidden()) return

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
      const splashDuration = 5000
      const elapsed = Date.now() - start
      const delay = splashDuration - elapsed
      const whenHidden = new Promise<void>((resolve) => setTimeout(() => {
        splashHidden(true)
        resolve()
      }, delay))

      ctx.queue(whenHidden)
    }
  }
}

Router.use(splashPageMiddleware)

Router.useRoutes({
  '/': 'home'
})

ko.applyBindings({ splashHidden })
