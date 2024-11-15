import {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./App.css";
import FileUploader from "./components/FileUploader";
import Papa from "papaparse";
import FieldMapper from "./components/FieldMapper";
import { AppState, FieldMap, MaybeFieldMap, WorkerData } from "./types";

import "@picocss/pico/css/pico.min.css";

function App() {
  const [csv, setCsv] = useState<Papa.ParseResult<unknown>>();
  const [mappedFields, setMappedFields] = useState<MaybeFieldMap>();
  const [appState, setAppState] = useState<AppState>("preProcess");
  const [csvParserError, setCsvParserError] = useState<boolean>(false);
  const [result, setResult] = useState<string>();
  const [numCols, setNumCols] = useState<number>();

  const onFileSelected = useCallback((content: string) => {
    const parsedContent = Papa.parse(content, {
      header: true,
    });
    setCsv(parsedContent);
    if (
      parsedContent.errors.length ||
      parsedContent.meta.aborted ||
      parsedContent.meta.truncated
    ) {
      setCsvParserError(true);
    }
    setAppState("preProcess");
    setResult(undefined);
  }, []);

  const onFieldsMapped = useCallback((fields: FieldMap | undefined) => {
    setMappedFields(fields);
  }, []);

  const onProcessClicked = () => {
    setAppState("processing");
  };

  const worker: Worker = useMemo(
    () => new Worker(new URL("./worker/processCsv.ts", import.meta.url)),
    []
  );

  useEffect(() => {
    if (!worker) return;
    worker.onmessage = (e: MessageEvent<Record<string, string>[]>) => {
      console.log("worker finished with", e.data);
      setResult(URL.createObjectURL(new Blob([Papa.unparse(e.data)])));
      setTimeout(() => {
        setAppState("complete");
      }, 2000);
    };
  }, [worker]);

  useEffect(() => {
    if (appState === "processing")
      worker.postMessage({
        csv,
        fields: mappedFields,
        numCols,
      } as WorkerData);
  }, [appState, csv, mappedFields, numCols, worker]);

  const onNumColsChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumCols(Number(val));
  };
  const onStartOverClicked = () => {
    setCsv(undefined);
    setAppState("preProcess");
    setCsvParserError(false);
    setResult(undefined);
  };

  return (
    <main className="container">
      <h1>ALC Tent Assigner</h1>
      {appState === "preProcess" && (
        <div>
          <h2>Step 1: Pick a file.</h2>
          <div>
            <FileUploader onFileSelected={onFileSelected} />
          </div>

          {csv && !csv?.meta?.fields && (
            <div>Your CSV doesn't contain any fields.</div>
          )}
          {csv?.data.length && <p>Found {csv.data.length} rows.</p>}
          {csvParserError && (
            <article>
              <h6>There were errors parsing the CSV.</h6>
              <p>
                The following errors were encountered when parsing the uploaded
                CSV file. They may or may not impact functionality.
              </p>
              {csv?.meta.truncated && <p>Truncated: {csv?.meta.truncated}</p>}
              {csv?.meta.aborted && <p>Aborted: {csv?.meta.aborted}</p>}
              {csv?.errors && <p>Errors: {JSON.stringify(csv?.errors)}</p>}
            </article>
          )}
          {csv?.meta?.fields && (
            <Fragment>
              <h2>Step 2: Map fields.</h2>
              <FieldMapper
                fields={csv.meta.fields}
                onFieldsMapped={onFieldsMapped}
              />
              <h2>Step 3: Choose number of tents in each row.</h2>
              <input
                type="number"
                name="numCols"
                placeholder="Enter number of tents per row"
                value={numCols}
                onChange={onNumColsChanged}
              />
            </Fragment>
          )}
          {csv && (
            <div>
              <button onClick={onProcessClicked} disabled={!mappedFields}>
                Process
              </button>
            </div>
          )}
        </div>
      )}
      {appState === "processing" && <article aria-busy="true"></article>}
      {appState === "complete" && result && (
        <Fragment>
          <h2>Step 4: Download the result!</h2>
          <a href={result} download="result.csv" role="button">
            Download
          </a>
          <a
            href="/"
            role="button"
            className="outline"
            onClick={onStartOverClicked}
            style={{ marginLeft: "1em" }}
          >
            Start over
          </a>
        </Fragment>
      )}
    </main>
  );
}

export default App;
