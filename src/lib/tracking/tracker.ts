import { supabase } from '@/integrations/supabase/client'
import { v4 as uuidv4 } from 'uuid'

class Tracker {
  private sessionId: string
  private visitorId: string
  private queue: any[]
  private processing: boolean

  constructor() {
    this.sessionId = uuidv4()
    this.visitorId = this.getVisitorId()
    this.queue = []
    this.processing = false
    this.initSession()
  }

  private getVisitorId(): string {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = uuidv4()
      localStorage.setItem('visitor_id', visitorId)
    }
    return visitorId
  }

  private async initSession() {
    const { error } = await supabase
      .from('tracking_sessions')
      .insert({
        id: this.sessionId,
        visitor_id: this.visitorId,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screen_resolution: this.getScreenResolution(),
        language: navigator.language
      })

    if (error) {
      console.error('Error initializing session:', error)
    }
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet'
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile'
    }
    return 'desktop'
  }

  private getBrowser(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer'
    return 'Unknown'
  }

  private getOS(): string {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'MacOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`
  }

  private getUTMParameters(): Record<string, string> {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || ''
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const event = this.queue.shift()

    try {
      const { error } = await supabase.functions.invoke('track', {
        body: {
          ...event,
          session_id: this.sessionId,
          ...this.getUTMParameters(),
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer,
          user_agent: navigator.userAgent
        }
      })

      if (error) {
        console.error('Error tracking event:', error)
        this.queue.unshift(event)
      }
    } catch (error) {
      console.error('Error processing event:', error)
      this.queue.unshift(event)
    }

    this.processing = false
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  public trackEvent(eventType: string, eventName: string, eventData?: any) {
    this.queue.push({
      event_type: eventType,
      event_name: eventName,
      event_data: eventData,
      created_at: new Date().toISOString()
    })
    this.processQueue()
  }

  public trackPageView(title: string) {
    const { error } = supabase
      .from('tracking_pageviews')
      .insert({
        session_id: this.sessionId,
        url: window.location.href,
        path: window.location.pathname,
        title
      })

    if (error) {
      console.error('Error tracking pageview:', error)
    }
  }

  public trackConversion(type: string, value?: number, data?: any) {
    this.trackEvent('conversion', type, { value, ...data })
  }
}

export const tracker = new Tracker()