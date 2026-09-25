import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Empieza igual que el servidor (sin acceso a `window`) para evitar un
  // mismatch de hidratación; el valor real se aplica después de montar.
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
