import { ServerRespond } from './DataStreamer';

export interface Row {  // determines the structure of the object returned by generateRow(); corresponds to table schema in Graph.tsx
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,   // keep me
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined, // number or undefined
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;   //taking avg of prices
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;   //taking avg of prices
    const ratio = priceABC / priceDEF;  //define ratio
    const upperBound = 1 + 0.03;  // changed values to trigger the trigger_alert; currently reflecting +/- 3% of historical avg. ratio
    const lowerBound = 1 - 0.03;  //    ↑
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,  // render trigger_alert only if ratio greater than/lesser than upper/lower bounds, otherwise trigger_alert not rendered
    }
  };
};
