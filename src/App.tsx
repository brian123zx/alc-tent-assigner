import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader";
import Papa from "papaparse";
import FieldMapper from "./components/FieldMapper";
import { AppState, FieldMap } from "./types";

function App() {
  const [csv, setCsv] = useState<Papa.ParseResult<unknown>>();
  const [mappedFields, setMappedFields] = useState<FieldMap>();
  const [appState, setAppState] = useState<AppState>("preProcess");

  const onFileSelected = useCallback(
    (content: string) => {
      const parsedContent = Papa.parse(content, {
        header: true,
      });
      setCsv(parsedContent);
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
    worker.onmessage = (e: MessageEvent<string>) => {
      console.log("worker finished with", e.data);
    };
  }, [worker]);

  useEffect(() => {
    if (appState === "processing")
      worker.postMessage({
        csv,
        fields: mappedFields,
      });
  }, [appState]);

  return (
    <div className="App">
      <div>
        <FileUploader onFileSelected={onFileSelected} />
      </div>
      {!csv?.meta?.fields && <div>Your CSV doesn't contain any fields.</div>}
      {csv?.meta?.fields && (
        <FieldMapper fields={csv.meta.fields} onFieldsMapped={onFieldsMapped} />
      )}
      {csv && (
        <div>
          <button onClick={onProcessClicked} disabled={!mappedFields}>
            Process
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
