import { Component, OnInit } from '@angular/core';

interface Collection {
  imgSrc: string;
  title: string;
  price: number;
  endDate: Date;
}

enum ButtonOption {
  raffles = 'Raffles',
  auctions = 'Auctions'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /** List of NFT Collections */
  collectionList: Collection[] = [];

  /** Currently selected button */
  selectedButton: ButtonOption = ButtonOption.raffles;

  /** Expose button option enum to HTML */
  ButtonOption = ButtonOption;

  constructor() {}

  /** Lifecycle init */
  ngOnInit() {
    this.addDummyCollections();
  }

  /** Switch tab to Raffles */
  selectRaffles() {
    this.selectedButton = ButtonOption.raffles;
  }

  /** Switch tab to Auctions */
  selectAuctions() {
    this.selectedButton = ButtonOption.auctions;
  }
  
  /** Add dummy collections */
  addDummyCollections() {
    this.collectionList.push({
      imgSrc: 'https://store.degods.com/_next/image?url=https%3A%2F%2Fdjib.io%2Fipfs%2FQmUATVBy7kXSsW7oCYUXGiRzW5GckC1LsNH4zybjVBdHt3&w=1080&q=75',
      title: 'Dazed Ducks',
      price: 100,
      endDate: new Date()
    } as Collection);

    this.collectionList.push({
      imgSrc: 'https://store.degods.com/_next/image?url=https%3A%2F%2Fi.ibb.co%2F1sQDwwv%2Fmonkeykingdom.jpg&w=1080&q=75',
      title: 'Monkey Kingdom Gen 3 - W/L (ETH)',
      price: 20,
      endDate: new Date()
    } as Collection);

    this.collectionList.push({
      imgSrc: 'https://store.degods.com/_next/image?url=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2FFOeVFkvUcAAt5WC%3Fformat%3Djpg%26name%3Dmedium&w=1080&q=75',
      title: 'Monkey Kingdom',
      price: 0.6,
      endDate: new Date()
    } as Collection);

    this.collectionList.push({
      imgSrc: 'https://store.degods.com/_next/image?url=https%3A%2F%2Fi.ibb.co%2FKW914PQ%2FCAT-IN-THE-HAT.jpg&w=1080&q=75',
      title: 'Dahklys',
      price: 5,
      endDate: new Date()
    } as Collection);
  }
}
