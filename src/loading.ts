import * as ko from 'knockout'
import ToProgress from 'toprogress'
import { Context } from '@profiscience/knockout-contrib-router'

const showOverlay = ko.observable(false)
let loadingBar: ToProgress
let loadingBarInterval: NodeJS.Timer

function startLoadingBar() {
  loadingBar = new ToProgress({
    color: '#000',
    duration: 0.2,
    height: '5px'
  })
  loadingBarInterval = setInterval(() => loadingBar.increase(1), 100)
}

function stopLoadingBar() {
  loadingBar.finish()
  clearInterval(loadingBarInterval)
}

// start once on app startup, since we start the loader in
// the beforeDispose hook, not the beforeRender
startLoadingBar()

ko.components.register('overlay-loader', {
  viewModel: {
    instance: {
      showOverlay
    }
  },
  template: `
    <div class="overlay-loader" data-bind="visible: showOverlay">
      <div class="overlay-loader-inner">
        <label>&#9679;</label>
        <label>&#9679;</label>
        <label>&#9679;</label>
        <label>&#9679;</label>
        <label>&#9679;</label>
        <label>&#9679;</label>
      </div>
    </div>
  `
})

export function overlayMiddleware(ctx: Context) {
  // we only want to run this for the terminal router
  if (ctx.$child) return {}
  return {
    // show the loader when the last page starts its cleanup, if any
    // using this instead of beforeRender also prevents having to fight
    // z-indexes with the splash page.
    beforeDispose: () => showOverlay(true),
    // hide the loader after the new page renders
    afterRender: () => showOverlay(false)
  }
}

export function progressBarMiddleware(ctx: Context) {
  // same as above, just separated for clarity
  if (ctx.$child) return {}
  return {
    beforeDispose: startLoadingBar,
    afterRender: stopLoadingBar
  }
}