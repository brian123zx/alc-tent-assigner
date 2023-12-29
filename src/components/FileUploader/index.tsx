import { useFilePicker } from "use-file-picker";

type FileUploaderProps = {
  onFileSelected: (content: string) => void;
};

const FileUploader = ({ onFileSelected }: FileUploaderProps) => {
  const { openFilePicker, loading } = useFilePicker({
    accept: ".csv",
    multiple: false,
    onFilesSelected(data) {
      console.log(data);
      onFileSelected(data?.filesContent?.[0]?.content);
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFilePicker()}>Select CSV file</button>
    </div>
  );
};

export default FileUploader;
