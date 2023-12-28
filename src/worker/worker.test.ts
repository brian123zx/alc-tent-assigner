import { sortFn } from "./processCsv";

function shuffle(array: any[]) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

const mockData = [
  {
    reqId: 'a',
    accId: 'a'
  },
  {
    reqId: 'a',
    accId: 'b'
  },
  {
    reqId: 'a',
    accId: ''
  },
  {
    reqId: 'b',
    accId: 'a'
  },
  {
    reqId: 'b',
    accId: 'b'
  },
  {
    reqId: '',
    accId: 'a'
  },
  {
    reqId: '',
    accId: ''
  },
];

describe('sortFn', () => {
  it('sorts correctly', () => {
    const data = shuffle([...mockData]);
    console.log(data)
    console.log(data.sort(sortFn({
      requestId: 'reqId',
      acceptanceId: 'accId',
      hasMedicalDevice: ''
    })))
    expect(data.sort(sortFn({
      requestId: 'reqId',
      acceptanceId: 'accId',
      hasMedicalDevice: ''
    }))).toEqual(mockData)
  })
})