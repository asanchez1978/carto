import { expect, Page } from '@playwright/test';

/**
 * Searches for elements on a web page and applies an assertion.
 * @param page The web page to search within.
 * @param elementsToSearch An array of strings representing the text to search for and ensure visibility.
 */

export async function findTextInPageByText(page: Page, textToSearch: string[]): Promise<void> {
    for (let texto of textToSearch) {
      await expect (page.getByText(texto)).toBeVisible();
    } 
  }
