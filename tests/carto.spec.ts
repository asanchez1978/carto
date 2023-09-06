import { test, expect } from '@playwright/test';
import { findTextInPageByText } from './functions/carto.functions'
import { mapLocators } from './locators/carto.locators'


/*test.beforeEach(async ({ page }) => {
  await page.goto('https://climate-resilience.hidot.hawaii.gov/');
});*/


test.describe('Carto QA entry technical test', () => {

test('Carto - Test 1 - Check content inside a web', async ({ page }) => {

  const TextToSearch = ['The State Highway System provides mobility for over 1.4 million Hawai‘i resident',
  'The segments of the State Highway System that experience the highest freight vol',
  'Various climate hazards can impact this system by rendering infrastructure impas'
];

  await page.goto('https://climate-resilience.hidot.hawaii.gov/');
  await expect(page).toHaveTitle(/Hawaii Highways/);
  await page.locator('#back-to-top-anchor').getByRole('button', { name: 'Explore map' }).click();
  await expect(page.locator('#deckgl-overlay')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

  try {
    await findTextInPageByText(page,TextToSearch); // Call the search function with the text to search
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Check the Widget is visible
  await expect(page.getByLabel('HDOT Assets by Type')).toBeVisible().then(async () => {
    await expect (page.locator(mapLocators.bridgeLocator).first()).toBeVisible();
    await expect (page.locator(mapLocators.roadwayLocator).first()).toBeVisible();
    await expect (page.locator(mapLocators.culvertLocator).first()).toBeVisible();
    await expect (page.locator(mapLocators.tunnelLocator).first()).toBeVisible();
  });

  
});

test('Carto - Test 2 - If an index of a dataset is not present, the button is not visible.', async ({ page }) => {

  const indexToCheck: { [key: string]: any } = {
    index: 'Thematic Indices not got from web',
    winds: 'Wind information',
  }; // Which dataset to check valid for visible and not visible items defined inside commons


  const jsontoCheck ='datasets.json'; // Which json to check
  const jsonResponse = await page.goto('https://climate-resilience.hidot.hawaii.gov/data/'+jsontoCheck);

  if (jsonResponse === null) {
      throw new Error('json file not retrieved');
    }

  // Check that the indexToCheck to check are inside jsontoCheck and apply the expected behavior
  await page.goto('https://climate-resilience.hidot.hawaii.gov/');
  await expect(page).toHaveTitle(/Hawaii Highways/);
  await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();

  const jsonFile = await jsonResponse.json();
  const jsonCommons = jsonFile.commons;

  for (let indexInCommons of Object.keys(indexToCheck)){
    
    if (jsonCommons.hasOwnProperty(indexInCommons)) {
        // The button associated to the json index is visible
        let itemLabel =  jsonCommons[indexInCommons].label;
        console.log(itemLabel)
        await expect (page.getByLabel(itemLabel)).toBeVisible();
    } else {
        // The button associated to the json index is not visible
        let itemLabel = indexToCheck[indexInCommons]
        console.log(itemLabel)
        await expect (page.getByLabel(itemLabel)).not.toBeVisible();
    }
  }
});

test('Carto - Test 3 - Menu navigation + Zoom test.', async ({ page }) => {

  // Define menus and headings that are elegible to check, menu,headings and element has to be alligend with the correct values
  const menus = ['Climate resilience','Action Plan','Climate stressor','The Urgency','HDOT Map','Map components'];
  const headings = ['Climate resilience','The HDOT Action Plan','Climate stressor','The Urgency','map screenshot','Map components'];
  const element = ['heading','heading','heading','heading','img','heading'];
  let zoomValue = 7

  let attemps = 1;
  let index:number = 0

  await page.goto('https://climate-resilience.hidot.hawaii.gov/');
  await expect(page).toHaveTitle(/Hawaii Highways/);
  await page.goto('https://climate-resilience.hidot.hawaii.gov/#back-to-top-anchor');
  
  
  while(index < attemps){

    menus.forEach(async (menu, i) => {

      const heading = headings[i];
      const elementType = element[i];

      await page.getByRole('tab', { name: menu }).click();

      switch(elementType) { 
        case 'heading': { 
          await expect (page.getByRole('heading', { name: heading })).toBeVisible();
           break; 
        } 
        case 'img': { 
          await expect (page.getByRole('img', { name: heading })).toBeVisible();
           break; 
        } 
      }
      
    });
   index++;
  }

  // Click on logo + ExploreMap
  await page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
  await expect( page.locator('#back-to-top-anchor').getByRole('button', { name: 'Explore map' })).toBeVisible()
  await page.locator('#back-to-top-anchor').getByRole('button', { name: 'Explore map' }).click();

  // Zoom test
  await expect(page.locator(mapLocators.zoomLocator)).toBeVisible()
  expect (page.locator(mapLocators.zoomLocator)).toContainText(zoomValue.toString())
  
  await page.getByLabel('Increase zoom').click().then(() =>{
      zoomValue = zoomValue+1
      expect (page.locator(mapLocators.zoomLocator)).toContainText(zoomValue.toString())
  });

  await page.getByLabel('Decrease zoom').click().then(() =>{
    zoomValue = zoomValue-1
    expect (page.locator(mapLocators.zoomLocator)).toContainText(zoomValue.toString())
  });

});

});