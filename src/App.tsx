import { useCallback, useState } from "react";
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
    console.log(fields);
  }, []);

  const onProcessClicked = () => {
    setAppState("processing");
  };

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
