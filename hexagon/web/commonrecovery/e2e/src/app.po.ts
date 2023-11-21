import { browser, by, element } from 'protractor';

export class AppPage {

  /** Navigate to root page. */
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  /** Gets text from app-root header. */
  async getTitleText(): Promise<string> {
    return element(by.css('app-root .content span')).getText();
  }
}
