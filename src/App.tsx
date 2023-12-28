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
import { AppState, FieldMap, WorkerData } from "./types";

function App() {
  const [csv, setCsv] = useState<Papa.ParseResult<unknown>>();
  const [mappedFields, setMappedFields] = useState<FieldMap>();
  const [appState, setAppState] = useState<AppState>("preProcess");
  const [csvParserError, setCsvParserError] = useState<boolean>(false);
  const [result, setResult] = useState<string>();

  const onFileSelected = useCallback(
    (content: string) => {
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
    },
    [csv]
  );

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
    };
  }, [worker]);

  useEffect(() => {
    if (appState === "processing")
      worker.postMessage({
        csv,
        fields: mappedFields,
        numCols,
      } as WorkerData);
  }, [appState]);

  const [numCols, setNumCols] = useState<number>();
  const onNumColsChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumCols(Number(val));
  };

  return (
    <div className="App">
      <div>
        <FileUploader onFileSelected={onFileSelected} />
      </div>
      {appState === "preProcess" && (
        <div>
          {csv && !csv?.meta?.fields && (
            <div>Your CSV doesn't contain any fields.</div>
          )}
          {csvParserError && (
            <div>
              There was an error parsing the CSV.
              <br />
              <p>Truncated: {csv?.meta.truncated}</p>
              <p>Aborted: {csv?.meta.aborted}</p>
              <p>Errors: {JSON.stringify(csv?.errors)}</p>
            </div>
          )}
          {csv?.meta?.fields && (
            <Fragment>
              <FieldMapper
                fields={csv.meta.fields}
                onFieldsMapped={onFieldsMapped}
              />
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
      {result && (
        <a href={result} download="result.csv">
          Download
        </a>
      )}
    </div>
  );
}

export default App;
