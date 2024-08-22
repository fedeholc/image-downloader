
import { test, expect } from '@playwright/test';

test.setTimeout(0);

test('imgs', async ({ page }) => {

  await page.goto('https://www.nytimes.com/2019/01/16/lens/helen-levitts-street-photos-blend-the-poetic-with-the-political.html');
  await page.waitForLoadState("domcontentloaded");

  const itemsContainer = await page.locator('img').all();

  //console.log("largo:", itemsContainer.length);

  let result = [];

  for (let item of itemsContainer) {

    if (item) {
      const srcSet = await item.getAttribute('srcset');

      //convert srcset to array
      if (srcSet) {
        const srcArray = srcSet.split(",");
        const srcArray2 = srcArray.map((item) => {
          return item.split(" ")[0];
        });
       }
    }

  };

});
