import { UploadFileField } from "./uploadFileField";

export const UploadButtons = ({setImage, setWatermark, imageField, watermarkField}) => {
  return (
    <div className='flex flex-row gap-2 flex-wrap'>
      <UploadFileField label={'Загрузите фото:'} formField={imageField} onLoad={setImage} />
      <UploadFileField label={'Загрузите водяной знак:'} formField={watermarkField} onLoad={setWatermark}/>
    </div>
  );
}