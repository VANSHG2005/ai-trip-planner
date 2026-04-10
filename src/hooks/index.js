import { useState, useEffect, useCallback, useRef } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue }
    catch { return initialValue }
  })
  const set = useCallback((val) => {
    try {
      const v = typeof val === 'function' ? val(value) : val
      setValue(v); localStorage.setItem(key, JSON.stringify(v))
    } catch (err) { console.warn('localStorage error:', err) }
  }, [key, value])
  return [value, set]
}

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useScrollDirection() {
  const [direction, setDirection] = useState('up')
  const lastY = useRef(0)
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      setDirection(y > lastY.current && y > 80 ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return direction
}

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(e) }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => { document.removeEventListener('mousedown', listener); document.removeEventListener('touchstart', listener) }
  }, [ref, handler])
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}
