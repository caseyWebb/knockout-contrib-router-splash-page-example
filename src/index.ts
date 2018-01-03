import * as $ from 'jquery'
import * as ko from 'knockout'
import { Context, Router } from '@profiscience/knockout-contrib-router'
import { overlayLoaderMiddleware, progressBarMiddleware } from './middleware/loading'
import { splashScreenMiddleware } from './middleware/splash'

ko.components.register('app', {
  template: `
    <overlay-loader></overlay-loader>
    <router></router>
  `
})

ko.components.register('home', {
  template: `
    <h1>Home</h1>
    <a data-bind="path: '/about'">Go to about</a>
  `
})

ko.components.register('about', {
  template: `
    <h1>About</h1>
    <a data-bind="path: '/'">Go home</a>
  `
})

Router.setConfig({
  hashbang: true,

  // gh-pages, see https://caseyWebb.github.io/knockout-contrib-router-splash-page-example/dist
  base: location.hostname.toLowerCase() === 'caseywebb.github.io'
    ? '/knockout-contrib-router-splash-page-example/dist'
    : ''
})

Router
  // changing the order of the progress bar middleware and splash
  // middleware will alter the behaviour. as written, the progress
  // bar completes when the app is ready. if moved after the splash
  // middleware, it will not finish until the splash is skipped or
  // times out, because it runs in-band (i.e. it does not use ctx.queue
  // or handle promises in a closure.)
  .use(overlayLoaderMiddleware)
  .use(progressBarMiddleware)
  .use(splashScreenMiddleware)

// irl, this might be an ajax call that adds data to the context,
// an import() statement to load the view, or any number of
// async operations needed to render the route
function simulateSomeAsyncMiddleware() {
  return new Promise((resolve) => setTimeout(resolve, 1500))
}

Router.useRoutes({
  '/': [
    simulateSomeAsyncMiddleware,
    'home'
  ],
  '/about': [
    simulateSomeAsyncMiddleware,
    'about'
  ]
})

ko.applyBindings()
