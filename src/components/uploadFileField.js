import { fileOpen } from 'browser-fs-access';
import { useState } from 'react';

export const UploadFileField = ({label, formField, onLoad}) => {

  const [fileName, setFileName] = useState('');

  const handleClick = async () => {
    fileOpen({
      mimeTypes: ['image/*'],
    }).then((file) => {
      setFileName(file.name);
      const imageUrl = URL.createObjectURL(file);
      const fileName = file.name.split('.');
      let extension = '';
      if(fileName.length > 1){
        extension = fileName.pop();
      }
      onLoad(imageUrl, fileName, extension);
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-col">
        <label className="block font-bold mb-2 truncate">{label}</label>
        <input type="text" {...formField} className="hidden" />
        <button type="button" onClick={handleClick} className="py-2 px-3 text-sm font-semibold rounded-md shadow focus:outline-none border">Выберите файл</button>
        <div className="mb-2 truncate w-2/3">
          {fileName}
        </div>
      </div>
    </>
  );
};