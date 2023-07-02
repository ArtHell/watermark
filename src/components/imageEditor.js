import { useCallback, useEffect, useState } from "react";
import { ImageSettings } from "./imageSettings";
import { UploadButtons } from "./uploadButtons";
import { useForm } from "react-hook-form";
import { useCanvas } from "../hooks/useCanvas";
import { debounce } from "lodash";

export const ImageEditor = () => {
  const { register, setValue, handleSubmit, getValues, watch } = useForm({
    defaultValues: {
      image: '',
      watermark: '',
      watermarkCorner: 'bottom-right',
      watermarkXOffset: 32,
      watermarkYOffset: 32,
      watermarkScale: 50,
      watermarkOpacity: 100,
    }
  });
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [imageFileName, setImageFileName] = useState('image');
  const watchAllFields = watch();

  const canvasRef = useCanvas(([canvas, ctx]) => { });

  const drawWatermark = useCallback((watermarkImg, img, ctx) => {
    const watermarkScale = getValues('watermarkScale') / 100;
    const watermarkOpacity = getValues('watermarkOpacity') / 100;
    const watermarkXOffset = getValues('watermarkXOffset');
    const watermarkYOffset = getValues('watermarkYOffset');
    const watermarkCorner = getValues('watermarkCorner');
    ctx.globalAlpha = watermarkOpacity;
    switch (watermarkCorner) {
      case 'top-left': {
        ctx.drawImage(
          watermarkImg, 
          watermarkXOffset, 
          watermarkYOffset, 
          watermarkImg.width * watermarkScale, 
          watermarkImg.height * watermarkScale);
        break;
      }
      case 'top-right': {
        ctx.drawImage(
          watermarkImg, 
          img.width - watermarkImg.width * watermarkScale - watermarkXOffset, 
          watermarkYOffset, 
          watermarkImg.width * watermarkScale, 
          watermarkImg.height * watermarkScale);
        break;
      }
      case 'bottom-left': {
        ctx.drawImage(
          watermarkImg, 
          watermarkXOffset, 
          img.height - watermarkImg.height * watermarkScale - watermarkYOffset, 
          watermarkImg.width * watermarkScale, 
          watermarkImg.height * watermarkScale);
        break;
      }
      case 'bottom-right': {
        ctx.drawImage(
          watermarkImg, 
          img.width - watermarkImg.width * watermarkScale - watermarkXOffset, 
          img.height - watermarkImg.height * watermarkScale - watermarkYOffset, 
          watermarkImg.width * watermarkScale, 
          watermarkImg.height * watermarkScale);
        break;
      }
      default: {
        break;
      }
    }
    ctx.globalAlpha = 1;
  }, [getValues]);

  const drawImage = useCallback(() => {
    if (!getValues('image')) return;
    const img = new Image();
    img.src = getValues('image');
    img.onload = () => {
      setCanvasWidth(img.width);
      setCanvasHeight(img.height);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      if (!getValues('watermark')) return;
      const watermarkImg = new Image();
      watermarkImg.src = getValues('watermark');
      watermarkImg.onload = () => {
        drawWatermark(watermarkImg, img, ctx);
      }
    }
  }, [getValues, canvasRef, drawWatermark]);

  const debouncedDraw = useCallback(debounce(drawImage, 300, {leading: false}), []);

  useEffect(() => {
    debouncedDraw();
  }, [canvasWidth, canvasHeight, drawImage, watchAllFields, debouncedDraw]);

  const imageField = register("image", { required: true });
  const watermarkField = register("watermark", { required: true });
  const watermarkCornerField = register("watermarkCorner", { required: true, validate: value => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value) });
  const watermarkOpacityField = register("watermarkOpacity", { required: true, validate: value => value >= 0 && value <= 100 });
  const watermarkScaleField = register("watermarkScale", { required: true, validate: value => value >= 0 && value <= 200 });
  const watermarkXOffsetField = register("watermarkXOffset", { required: true, validate: value => value >= 0 });
  const watermarkYOffsetField = register("watermarkYOffset", { required: true, validate: value => value >= 0 });


  const downloadImage = () => {
    const canvas = canvasRef.current;
    var url = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = `${imageFileName}_wm.png`;
    link.href = url;
    link.click();
  }

  handleSubmit(downloadImage);

  return (
    <form className="flex flex-col items-center my-8">
      <UploadButtons imageField={imageField} watermarkField={watermarkField} setImage={(value, fileName) => {setValue('image', value);  setImageFileName(fileName);}} setWatermark={value => setValue('watermark', value)} />
      <label className="block font-bold mb-2">{'Предпросмотр. Есть горизонтальная прокрутка'}</label>
      <div className="border border-black border-dashed overflow-x-auto w-full">
        <canvas width={canvasWidth} height={canvasHeight} ref={canvasRef} className="m-auto" />
      </div>
      <ImageSettings getValues={getValues} watermarkCornerField={watermarkCornerField} watermarkOpacityField={watermarkOpacityField} watermarkScaleField={watermarkScaleField} watermarkXOffsetField={watermarkXOffsetField} watermarkYOffsetField={watermarkYOffsetField} />
      <button type="button" onClick={downloadImage} className="py-4 px-16 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Скачать</button>
    </form>
  )
}