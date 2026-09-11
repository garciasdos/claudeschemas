import '../styles/base.css'

const mount = (): void => {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (app === null) {
    return
  }
  app.innerHTML = '<h1>claudeschemas</h1>'
}

mount()
