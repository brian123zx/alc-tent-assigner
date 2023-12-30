import _ from "lodash";
import { Grid, sortFn } from "./processCsv";

function shuffle(array: any[]) {
  var m = array.length,
    t,
    i;

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
    name: "alice",
    reqId: "a",
    accId: "a",
    med: '',
  },
  {
    name: "bob",
    reqId: "a",
    accId: "b",
    med: '',
  },
  {
    name: "bob2",
    reqId: "a",
    accId: "b",
    med: '',
  },
  {
    name: "charlie",
    reqId: "a",
    accId: "",
    med: '',
  },
  {
    name: "david",
    reqId: "b",
    accId: "a",
    med: 'TRUE',
  },
  {
    name: "eve",
    reqId: "b",
    accId: "b",
    med: '',
  },
  {
    name: "frank",
    reqId: "",
    accId: "a",
    med: '',
  },
  {
    name: "grace",
    reqId: "",
    accId: "",
    med: '',
  },
];



beforeEach(() => {
  jest.resetModules();
});

describe("sortFn", () => {
  const mockData = [
    {
      name: "alice",
      reqId: "a",
      accId: "a",
      med: '',
    },
    {
      name: "bob",
      reqId: "a",
      accId: "b",
      med: '',
    },
    {
      name: "charlie",
      reqId: "a",
      accId: "",
      med: '',
    },
    {
      name: "david",
      reqId: "b",
      accId: "a",
      med: 'TRUE',
    },
    {
      name: "eve",
      reqId: "b",
      accId: "b",
      med: '',
    },
    {
      name: "frank",
      reqId: "",
      accId: "a",
      med: '',
    },
    {
      name: "grace",
      reqId: "",
      accId: "",
      med: '',
    },
  ];
  it("sorts correctly", () => {
    const data = shuffle([...mockData]);
    console.log(data);
    console.log(
      data.sort(
        sortFn({
          requestId: "reqId",
          acceptanceId: "accId",
          hasMedicalDevice: "",
        })
      )
    );
    expect(
      data.sort(
        sortFn({
          requestId: "reqId",
          acceptanceId: "accId",
          hasMedicalDevice: "",
        })
      )
    ).toEqual(mockData);
  });
});

describe("assignTeam", () => {
  it('assigns team', async () => {
    const { assignTeam } = await import('./assignTeam');
    const grid = new Grid(4);
    const data = _.cloneDeep(mockData.slice(0, 4))
    assignTeam(data, grid, {
      requestId: 'reqId',
      acceptanceId: 'accId',
      hasMedicalDevice: 'med'
    });
    expect(grid.rows[0].tents).toMatchInlineSnapshot(`
Array [
  Object {
    "bed1": Object {
      "Tent ID": "A1",
      "accId": "a",
      "med": "",
      "name": "alice",
      "reqId": "a",
    },
    "isMedical": false,
  },
  Object {
    "bed1": Object {
      "Tent ID": "A2",
      "accId": "b",
      "med": "",
      "name": "bob",
      "reqId": "a",
    },
    "bed2": Object {
      "Tent ID": "A2",
      "accId": "b",
      "med": "",
      "name": "bob2",
      "reqId": "a",
    },
    "isMedical": false,
  },
  Object {
    "bed1": Object {
      "Tent ID": "A3",
      "accId": "",
      "med": "",
      "name": "charlie",
      "reqId": "a",
    },
    "isMedical": false,
  },
]
`);
  });
  it('assigns team to first row available', async () => {
    const { assignTeam } = await import('./assignTeam');
    const grid = new Grid(4);
    grid.createRow();
    grid.createRow();
    grid.rows[0].numOpen = 2;
    grid.rows[1].numOpen = 4;
    const data = _.cloneDeep(mockData.slice(0, 4))
    assignTeam(data, grid, {
      requestId: 'reqId',
      acceptanceId: 'accId',
      hasMedicalDevice: 'med'
    });
    expect(grid.rows[1]).toMatchInlineSnapshot(`
TentRow {
  "numOpen": 1,
  "rowId": "B",
  "tents": Array [
    Object {
      "bed1": Object {
        "Tent ID": "B1",
        "accId": "a",
        "med": "",
        "name": "alice",
        "reqId": "a",
      },
      "isMedical": false,
    },
    Object {
      "bed1": Object {
        "Tent ID": "B2",
        "accId": "b",
        "med": "",
        "name": "bob",
        "reqId": "a",
      },
      "bed2": Object {
        "Tent ID": "B2",
        "accId": "b",
        "med": "",
        "name": "bob2",
        "reqId": "a",
      },
      "isMedical": false,
    },
    Object {
      "bed1": Object {
        "Tent ID": "B3",
        "accId": "",
        "med": "",
        "name": "charlie",
        "reqId": "a",
      },
      "isMedical": false,
    },
  ],
}
`);
  });
  it('assigns team with medical rider', async () => {
    const { assignTeam } = await import('./assignTeam');
    const grid = new Grid(4);
    const data = _.cloneDeep(mockData.slice(4, 6))
    assignTeam(data, grid, {
      requestId: 'reqId',
      acceptanceId: 'accId',
      hasMedicalDevice: 'med'
    });
    expect(grid.rows[0]).toMatchInlineSnapshot(`
TentRow {
  "numOpen": 3,
  "rowId": "A",
  "tents": Array [
    Object {
      "bed1": Object {
        "Tent ID": "A1",
        "accId": "b",
        "med": "",
        "name": "eve",
        "reqId": "b",
      },
      "isMedical": false,
    },
  ],
}
`);
    expect(grid.medicalRows[0]).toMatchInlineSnapshot(`
TentRow {
  "numOpen": 3,
  "rowId": "A",
  "tents": Array [
    Object {
      "bed1": Object {
        "Tent ID": "*A1",
        "accId": "a",
        "med": "TRUE",
        "name": "david",
        "reqId": "b",
      },
      "isMedical": true,
    },
  ],
}
`);
  })
});

describe("processCsv", () => {
  it("should process CSV data correctly", async () => {
    const assignTeamSpy = jest.fn();
    jest.doMock("./assignTeam", () => {
      return {
        __esModule: true,
        assignTeam: assignTeamSpy,
      };
    });
    const { processCsv } = await import("./processCsv");
    const mock = {
      numCols: 4,
      fields: { requestId: 0, acceptanceId: 1, hasMedicalDevice: 2 },
      csv: {
        meta: { fields: ["reqId", "accId", "med"] },
        data: [...mockData],
      },
    };

    // @ts-expect-error full object not provided
    processCsv(mock);

    expect(assignTeamSpy).toHaveBeenCalled();
    expect(assignTeamSpy.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "accId": "a",
      "med": "",
      "name": "alice",
      "reqId": "a",
    },
    Object {
      "accId": "b",
      "med": "",
      "name": "bob",
      "reqId": "a",
    },
    Object {
      "accId": "b",
      "med": "",
      "name": "bob2",
      "reqId": "a",
    },
    Object {
      "accId": "",
      "med": "",
      "name": "charlie",
      "reqId": "a",
    },
  ],
  Grid {
    "createRow": [Function],
    "medicalRows": Array [],
    "numTents": 4,
    "placeMedicalTents": [Function],
    "placeTents": [Function],
    "rows": Array [],
  },
  Object {
    "acceptanceId": "accId",
    "hasMedicalDevice": "med",
    "requestId": "reqId",
  },
]
`);
    expect(assignTeamSpy.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "accId": "a",
      "med": "TRUE",
      "name": "david",
      "reqId": "b",
    },
    Object {
      "accId": "b",
      "med": "",
      "name": "eve",
      "reqId": "b",
    },
  ],
  Grid {
    "createRow": [Function],
    "medicalRows": Array [],
    "numTents": 4,
    "placeMedicalTents": [Function],
    "placeTents": [Function],
    "rows": Array [],
  },
  Object {
    "acceptanceId": "accId",
    "hasMedicalDevice": "med",
    "requestId": "reqId",
  },
]
`);
    expect(assignTeamSpy.mock.calls[2]).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "accId": "a",
      "med": "",
      "name": "frank",
      "reqId": "",
    },
    Object {
      "accId": "",
      "med": "",
      "name": "grace",
      "reqId": "",
    },
  ],
  Grid {
    "createRow": [Function],
    "medicalRows": Array [],
    "numTents": 4,
    "placeMedicalTents": [Function],
    "placeTents": [Function],
    "rows": Array [],
  },
  Object {
    "acceptanceId": "accId",
    "hasMedicalDevice": "med",
    "requestId": "reqId",
  },
]
`);
  });
});

