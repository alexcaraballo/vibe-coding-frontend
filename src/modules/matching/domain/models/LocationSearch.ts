export interface LocationSearchRequest {
  lat: number
  lng: number
  radiusKm?: number
}

export interface LocationSearchResult {
  trips: any[] // Array de trips que se encontraron cerca
  totalResults: number
}
