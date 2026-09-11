export const requireElement = <T extends HTMLElement>(id: string, type: new () => T): T => {
  const element = document.getElementById(id)
  if (!(element instanceof type)) {
    throw new Error(`Expected #${id} to be a ${type.name}`)
  }
  return element
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag)
  if (className !== undefined) {
    element.className = className
  }
  if (text !== undefined) {
    element.textContent = text
  }
  return element
}
