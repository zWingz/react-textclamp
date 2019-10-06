export function addResizeEventListener(ele, resizeHandle) {
  const obj = document.createElement('object')
  obj.setAttribute(
    'style',
    'position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;opacity: 0; pointer-events: none; z-index: -1;'
  )
  obj.onload = () => {
    obj.contentDocument.defaultView.addEventListener(
      'resize',
      resizeHandle,
      false
    )
  }
  obj.type = 'text/html'
  ele.appendChild(obj)
  obj.data = 'about:blank'
  return obj
}
