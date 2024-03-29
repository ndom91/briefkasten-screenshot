import chrome from 'chrome-aws-lambda'
import { chromium } from 'playwright-core'
import { serverTiming } from './../lib/helpers.js'
import Fastify from 'fastify'

const app = Fastify({
  logger: process.env.NODE_ENV === 'development' ? true : false,
})

const allowedOrigins = ['localhost', 'briefkastenhq.com', 'ndo.dev']

const resolveOrigin = (origin) => {
  if (allowedOrigins.includes(new URL(origin).hostname)) {
    return origin
  }
  return ''
}

const handleScreenshot = async ({ params, url }) => {
  const { colorScheme, skipCookieBannerClick } = params

  serverTiming.start()
  serverTiming.measure('browserStart')
  const browser = await chromium.launch({
    args: chrome.args,
    executablePath:
      process.env.NODE_ENV !== 'development'
        ? await chrome.executablePath
        : '/bin/chromium',
    headless: true,
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  })
  serverTiming.measure('browserStart')
  serverTiming.measure('pageView')
  if (colorScheme) {
    await page.emulateMedia({ colorScheme })
  }
  await page.goto(url)
  serverTiming.measure('pageView')

  // Hack for accepting cookie banners
  if (!skipCookieBannerClick) {
    const selectors = [
      '[id*=cookie] a',
      '[class*=consent] button',
      '[class*=cookie] a',
      '[id*=cookie] button',
      '[class*=cookie] button',
    ]

    const regex =
      /(Accept all|I agree|Accept|Agree|Agree all|Ich stimme zu|Okay|OK)/

    serverTiming.measure('cookieHack')
    const elements = await page.$(`'${selectors.join(', ')}'`)
    if (elements) {
      for (const el of elements) {
        const innerText = (await el.getProperty('innerText')).toString()
        regex.test(innerText, 'ig') && el.click()
      }
    }

    serverTiming.measure('cookieHack')
  }
  serverTiming.measure('screenshot')
  // Snap screenshot
  const buffer = await page.screenshot({ type: 'png' })
  serverTiming.measure('screenshot')

  await page.close()
  await browser.close()

  return buffer
}

app.get('/', async () => {
  return { hello: 'world' }
})

/**
 * @type {import('fastify').RouteShorthandOptions}
 */
app.get('/api/image', async (req, reply) => {
  let { url } = req.query

  if (req.headers.origin) {
    reply.header(
      'Access-Control-Allow-Origin',
      resolveOrigin(req.headers.origin)
    )
  }

  if (!url) {
    url = req.body?.url ?? undefined
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    reply.header('Content-Type', 'application/json')
    throw { statusCode: 400, message: 'Missing URL Param' }
  }

  try {
    // Set the `s-maxage` property to cache at the CDN layer
    reply.header('Cache-Control', 's-maxage=31536000, public')
    reply.header('Content-Type', 'image/png')

    // Generate Server-Timing headers
    const imageBuffer = await handleScreenshot({ params: req.query, url })
    reply.header('Server-Timing', serverTiming.setHeader())
    return imageBuffer
  } catch (e) {
    console.error('Error generating screenshot -', e)
    return JSON.stringify({
      message: 'Image Capture Failed',
      error: e,
    })
  }
})

/**
 * @type {import('fastify').RouteShorthandOptions}
 */
app.post('/api/image', async (req, reply) => {
  let { url } = req.query

  if (!url) {
    url = req.body?.url ?? undefined
  }
  if (req.headers.origin) {
    reply.header(
      'Access-Control-Allow-Origin',
      resolveOrigin(req.headers.origin)
    )
  }
  if (!url) {
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    reply.header('Content-Type', 'application/json')
    throw { statusCode: 400, message: 'Missing URL Param' }
  }

  try {
    // Set the `s-maxage` property to cache at the CDN layer
    reply.header('Cache-Control', 's-maxage=31536000, public')
    reply.header('Content-Type', 'image/png')

    // Generate Server-Timing headers
    reply.header('Server-Timing', serverTiming.setHeader())

    return handleScreenshot({ params: req.query, url })
  } catch (e) {
    console.error('Error generating screenshot -', e)
    return JSON.stringify({
      message: 'Image Capture Failed',
      error: e,
    })
  }
})

export default async (req, res) => {
  await app.ready()
  app.server.emit('request', req, res)
}
