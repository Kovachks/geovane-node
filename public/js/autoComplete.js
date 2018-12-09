


const startCityAutocomplete = places({
    appId: 'pl3PTJ4TV68K',
    apiKey: 'dabd71a7698090c4b61f7afde506ff62',
    container: document.querySelector('#startCity')
}).configure({
  countries: ['us'],
  hitsPerPage: 4,
});

const endCityAutocomplete = places({
  appId: 'pl3PTJ4TV68K',
  apiKey: 'dabd71a7698090c4b61f7afde506ff62',
  container: document.querySelector('#endCity')
}).configure({
countries: ['us'],
hitsPerPage: 4,
});