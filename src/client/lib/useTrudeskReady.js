import { useEffect } from 'react'
import $ from 'jquery'

export default function useHelpdeskReady (callback) {
  useEffect(() => {
    $(window).on('trudesk:ready', () => {
      if (typeof callback === 'function') return callback()
    })
  }, [])
}
