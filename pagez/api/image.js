import chrome from 'chrome-aws-lambda'
import { chromium } from 'playwright-core'
import { serverTiming } from '@/lib/helpers'

export default async function Image(req, res) {
  try {
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
    /* await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 }) */
    serverTiming.measure('browserStart')
    serverTiming.measure('pageView')
    /* await page.goto(req.query.url, { waitUntil: 'networkidle0' }) */
    await page.goto(req.query.url)
    serverTiming.measure('pageView')

    // Hack for accepting cookie banners
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
    /* console.log('selector', selectors.join(', ')) */
    const elements = await page.$(`'${selectors.join(', ')}'`)
    if (elements) {
      /* console.log('els', elements) */
      for (const el of elements) {
        const innerText = (await el.getProperty('innerText')).toString()
        regex.test(innerText, 'ig') && el.click()
      }
    }

    // Wait for cookie banner to be gone
    /* await page.waitForNetworkIdle({ */
    /*   timeout: 25000, */
    /* }) */

    // Snap screenshot
    const buffer = await page.screenshot({ type: 'jpeg', quality: 50 })
    serverTiming.measure('cookieHack')

    await page.close()
    await browser.close()

    // Set the `s-maxage` property to cache at the CDN layer
    res.setHeader('Cache-Control', 's-maxage=31536000, public')
    res.setHeader('Content-Type', 'image/jpeg')
    // Generate Server-Timing headers
    res.setHeader('Server-Timing', serverTiming.setHeader())

    return res.end(buffer)
  } catch (e) {
    console.error('Error generating screenshot -', e)
    return res.json({
      message: 'Image Capture Failed',
      image: { error: e },
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}
