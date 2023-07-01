export const ImageSettings = ({ watermarkCornerField, watermarkOpacityField, watermarkScaleField, watermarkXOffsetField, watermarkYOffsetField }) => {
  return (
    <div className='flex flex-col items-center mt-8 mb-8'>
      <label className="block font-bold mb-2">{'Настройки водяного знака'}</label>
      <div className='flex flex-row gap-2 flex-wrap'>
        <div className='flex flex-col'>
          <label className="block font-bold mb-2">{'Расположение'}</label>
          <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" {...watermarkCornerField}>
            <option value="top-left">{'Верхний левый угол'}</option>
            <option value="top-right">{'Верхний правый угол'}</option>
            <option value="bottom-left">{'Нижний левый угол'}</option>
            <option value="bottom-right">{'Нижний правый угол'}</option>
          </select>
          <label className="block font-bold mb-2">{'Непрозрачность (%)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="range" {...watermarkOpacityField} />
          <label className="block font-bold mb-2">{'Масштаб(%)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="range"  {...watermarkScaleField} />
          <label className="block font-bold mb-2">{'Смещение по X (пиксели)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="number" {...watermarkXOffsetField} />
          <label className="block font-bold mb-2">{'Смещение по Y (пиксели)'}</label>
          <input className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline" type="number" {...watermarkYOffsetField} />
        </div>
      </div>
    </div>
  );
}