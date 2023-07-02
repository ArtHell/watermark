import { useRef, useState } from 'react';

export const UploadFileField = ({label, formField, onLoad}) => {
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      setIsLoadingFile(true);
      const reader = new FileReader();


      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      reader.onloadend = () => {
        setIsLoadingFile(false);
        setProgress(0);
      };

      reader.readAsDataURL(file);
      

      reader.onload = () => {
        const fileName = event.target.files[0].name.split('.');
        if(fileName.length > 1){
          fileName.pop();
        }
        
        onLoad(reader.result, fileName.join(''));
      };
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col">
        <label className="block font-bold mb-2 truncate">{label}</label>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
        <input type="text" {...formField} className="hidden" />
        <button type="button" onClick={handleClick} className="py-2 px-3 text-sm font-semibold rounded-md shadow focus:outline-none border">Выберите файл</button>
        <div className="mb-2 truncate w-2/3">
          {
            isLoadingFile ? `Loading ${fileName}} ${progress}%` : fileName
          }
        </div>
        {progress > 0 && (
          <div className="relative w-full h-2 rounded-sm mt-2">
            <div className="absolute top-0 left-0 bg-blue-500 h-full rounded-sm" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </>
  );
};