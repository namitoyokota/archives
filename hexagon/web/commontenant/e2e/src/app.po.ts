import { browser, by, element } from 'protractor';

export class AppPage {

  /** Navigate to root page. */
  navigateTo() {
    return browser.get('/');
  }

  /** Gets text from app-root header. */
  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
