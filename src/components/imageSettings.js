import { HexColorPicker } from "react-colorful";

export const ImageSettings = ({ setDefaultSettings, getValues, watermarkCornerField, watermarkOpacityField, watermarkScaleField, watermarkXOffsetField, watermarkYOffsetField, setWatermarkColor, watermarkEnableCustomColorField }) => {
  return (
    <div className='flex flex-col items-center mt-8 mb-8'>
      <label className="block font-bold mb-2">{'Настройки водяного знака'}</label>
      <div className='flex flex-row gap-2 flex-wrap'>
        <div className='flex flex-col'>
          <button type={'button'} className='bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded' onClick={setDefaultSettings}>{'Сбросить настройки'}</button>
          <label className="block font-bold mb-2">{'Расположение'}</label>
          <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" {...watermarkCornerField}>
            <option value="top-left">{'Верхний левый угол'}</option>
            <option value="top-right">{'Верхний правый угол'}</option>
            <option value="bottom-left">{'Нижний левый угол'}</option>
            <option value="bottom-right">{'Нижний правый угол'}</option>
          </select>
          <label className="block font-bold mb-2">{`Непрозрачность (%) | ${getValues('watermarkOpacity')}`}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="range" {...watermarkOpacityField} />
          <label className="block font-bold mb-2">{`Масштаб(%) | ${getValues('watermarkScale')}`}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="range" min={0} max={100}  {...watermarkScaleField} />
          <label className="block font-bold mb-2">{'Смещение по X (пиксели)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="number" {...watermarkXOffsetField} />
          <label className="block font-bold mb-2">{'Смещение по Y (пиксели)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="number" {...watermarkYOffsetField} />
          <label className="block font-bold mb-2">{'Включить цвет логотипа'}</label>
          <input className="block w-6 h-6 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="checkbox" {...watermarkEnableCustomColorField} />
          <label className="block font-bold mb-2">{'Цвет логотипа'}</label>
          <HexColorPicker color={getValues('watermarkColor')} onChange={color => setWatermarkColor(color)} />
        </div>
      </div>
    </div>
  );
}