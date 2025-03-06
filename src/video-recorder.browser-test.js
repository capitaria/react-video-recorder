/* eslint-env jest */
/* global page,browser */
const BASE_URL = 'http://localhost:6006'

describe('VideoRecorder', () => {
  jest.setTimeout(10000)

  it('records inline video', async () => {
    const context = browser.defaultBrowserContext()
    await context.overridePermissions(BASE_URL, ['camera', 'microphone'])
    await page.goto(
      `${BASE_URL}/iframe.html?selectedKind=VideoRecorder&selectedStory=with%20default%20config`
    )
    await page.click('[data-qa="turn-on-camera"]')
    await page.waitForSelector('[data-qa="start-recording"]')
    await page.click('[data-qa="start-recording"]')
    await page.waitForSelector('[data-qa="stop-recording"]')
    const DURATION = 2500
    await page.waitFor(DURATION)
    await page.click('[data-qa="stop-recording"]')
    await page.waitForSelector('video')

    // Esperar a que el video esté cargado y tenga una duración válida
    await page.waitForFunction(
      () => {
        const video = document.querySelector('video')
        console.log('Video status:', {
          exists: !!video,
          duration: video ? video.duration : 'no video',
          readyState: video ? video.readyState : 'no video'
        })
        return video && !isNaN(video.duration) && video.duration > 0
      },
      { timeout: 5000 }
    )

    const duration = await page.$eval('video', (el) => {
      console.log('Final video status:', {
        duration: el.duration,
        readyState: el.readyState,
        currentTime: el.currentTime
      })
      return el.duration
    })

    console.log('Duration in test:', duration * 1000, 'ms')
    expect(duration * 1000).toBeWithinRange(DURATION - 100, DURATION + 100)
  })
})
