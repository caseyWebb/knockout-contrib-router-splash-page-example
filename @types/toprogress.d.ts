declare module 'toprogress' {
  type ToProgressOpts = {
    color: string
    duration: number
    height: string
  }
  class ToProgress {
    constructor(opts: ToProgressOpts)
    increase(n: number): void
    finish(): void
  }
  export default ToProgress
}