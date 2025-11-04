/***
 * Exchange and region datasets for visualization seeding.
 * Contains approximate coordinates and hosting info for demo purposes.
 * Real deployments should source this from reliable provider/exchange metadata APIs.
***/
export type CloudProvider = "aws"|"gcp"|"azure";

export type ExchangeSite = {
  id:string;
  name:string;
  code:string;
  provider:CloudProvider;
  regionCode:string;
  lat:number;
  lon:number;
  host:string;
};

export type CloudRegion = {
  provider:CloudProvider;
  code:string;
  name:string;
  city:string;
  country:string;
  lat:number;
  lon:number;
};

export const cloudRegions:CloudRegion[] = [
  { provider:"aws", code:"us-east-1", name:"N. Virginia", city:"Ashburn", country:"US", lat:39.0438, lon:-77.4874 },
  { provider:"aws", code:"eu-central-1", name:"Frankfurt", city:"Frankfurt", country:"DE", lat:50.1109, lon:8.6821 },
  { provider:"aws", code:"ap-northeast-1", name:"Tokyo", city:"Tokyo", country:"JP", lat:35.6895, lon:139.6917 },
  { provider:"aws", code:"ap-southeast-1", name:"Singapore", city:"Singapore", country:"SG", lat:1.3521, lon:103.8198 },

  { provider:"gcp", code:"us-east4", name:"N. Virginia", city:"Ashburn", country:"US", lat:39.0438, lon:-77.4874 },
  { provider:"gcp", code:"europe-west3", name:"Frankfurt", city:"Frankfurt", country:"DE", lat:50.1109, lon:8.6821 },
  { provider:"gcp", code:"asia-northeast1", name:"Tokyo", city:"Tokyo", country:"JP", lat:35.6895, lon:139.6917 },
  { provider:"gcp", code:"asia-southeast1", name:"Singapore", city:"Singapore", country:"SG", lat:1.3521, lon:103.8198 },

  { provider:"azure", code:"eastus", name:"East US", city:"Virginia", country:"US", lat:37.4316, lon:-78.6569 },
  { provider:"azure", code:"westeurope", name:"West Europe", city:"Amsterdam", country:"NL", lat:52.3676, lon:4.9041 },
  { provider:"azure", code:"eastasia", name:"East Asia", city:"Hong Kong", country:"HK", lat:22.3193, lon:114.1694 },
  { provider:"azure", code:"southeastasia", name:"Southeast Asia", city:"Singapore", country:"SG", lat:1.3521, lon:103.8198 },
];

export const exchanges:ExchangeSite[] = [
  { id:"binance-tokyo", name:"Binance", code:"BIN", provider:"aws", regionCode:"ap-northeast-1", lat:35.6895, lon:139.6917, host:"binance.com" },
  { id:"bybit-singapore", name:"Bybit", code:"BYB", provider:"gcp", regionCode:"asia-southeast1", lat:1.3521, lon:103.8198, host:"bybit.com" },
  { id:"okx-hongkong", name:"OKX", code:"OKX", provider:"azure", regionCode:"eastasia", lat:22.3193, lon:114.1694, host:"okx.com" },
  { id:"deribit-amsterdam", name:"Deribit", code:"DRB", provider:"azure", regionCode:"westeurope", lat:52.3676, lon:4.9041, host:"deribit.com" },
  { id:"coinbase-virginia", name:"Coinbase", code:"CBX", provider:"aws", regionCode:"us-east-1", lat:39.0438, lon:-77.4874, host:"coinbase.com" },
  { id:"kraken-frankfurt", name:"Kraken", code:"KRK", provider:"gcp", regionCode:"europe-west3", lat:50.1109, lon:8.6821, host:"kraken.com" },
  { id:"bitfinex-zurich", name:"Bitfinex", code:"BFX", provider:"aws", regionCode:"eu-central-1", lat:47.3769, lon:8.5417, host:"bitfinex.com" },
];
