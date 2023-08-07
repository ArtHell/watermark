import { useCallback, useContext, useEffect, useState } from "react";
import { ImageSettings } from "./imageSettings";
import { UploadButtons } from "./uploadButtons";
import { useForm } from "react-hook-form";
import { useCanvas } from "../hooks/useCanvas";
import { debounce, get, set } from "lodash";
import { useUserSettings } from "../hooks/useUserSettings";
import { useMemo } from "react";

export const ImageEditor = () => {
  const [userSettings, saveSettings] = useUserSettings();

  const defaultSettings = useMemo(() => ({
    image: '',
    watermark: '',
    watermarkCorner: 'bottom-right',
    watermarkXOffset: 32,
    watermarkYOffset: 32,
    watermarkScale: 100,
    watermarkOpacity: 100,
    watermarkColor: '#ffffff',
    watermarkEnableCustomColor: false,
  }), []);

  const { register, setValue, handleSubmit, getValues, watch } = useForm({
    defaultValues: {
      ...defaultSettings,
      ...userSettings,
    }
  });

  const setDefaultSettings = useCallback(() => {
    setValue('watermarkCorner', defaultSettings.watermarkCorner);
    setValue('watermarkXOffset', defaultSettings.watermarkXOffset);
    setValue('watermarkYOffset', defaultSettings.watermarkYOffset);
    setValue('watermarkScale', defaultSettings.watermarkScale);
    setValue('watermarkOpacity', defaultSettings.watermarkOpacity);
    setValue('watermarkColor', defaultSettings.watermarkColor);
    setValue('watermarkEnableCustomColor', defaultSettings.watermarkEnableCustomColor);
  }, [defaultSettings, setValue]);

  const setWatermarkColor = useCallback((color) => {
    setValue('watermarkColor', color);
  }, [setValue]);

  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [demoCanvasWidth, setDemoCanvasWidth] = useState(300);
  const [demoCanvasHeight, setDemoCanvasHeight] = useState(300);
  const [imageFileName, setImageFileName] = useState('image');
  const watchAllFields = watch();

  const canvasRef = useCanvas(([]) => { });
  const demoCanvasRef = useCanvas(([]) => { });

  const drawWatermark = useCallback((watermarkImg, ctx, canvas) => {
    const watermarkScale = getValues('watermarkScale') / 100;
    const watermarkOpacity = getValues('watermarkOpacity') / 100;
    const watermarkXOffset = getValues('watermarkXOffset');
    const watermarkYOffset = getValues('watermarkYOffset');
    const watermarkCorner = getValues('watermarkCorner');
    ctx.globalAlpha = watermarkOpacity;
    const width = canvas.width * watermarkScale;
    const height = watermarkImg.height * width / watermarkImg.width;
    switch (watermarkCorner) {
      case 'top-left': {
        ctx.drawImage(
          watermarkImg,
          watermarkXOffset,
          watermarkYOffset,
          width,
          height);
        break;
      }
      case 'top-right': {
        ctx.drawImage(
          watermarkImg,
          canvas.width - width - watermarkXOffset,
          watermarkYOffset,
          width,
          height);
        break;
      }
      case 'bottom-left': {
        ctx.drawImage(
          watermarkImg,
          watermarkXOffset,
          canvas.height - height - watermarkYOffset,
          width,
          height);
        break;
      }
      case 'bottom-right': {
        ctx.drawImage(
          watermarkImg,
          canvas.width - width - watermarkXOffset,
          canvas.height - height - watermarkYOffset,
          width,
          height);
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
      const demoWidth = document.getElementById('demoCanvasWrapper').clientWidth;
      const demoHeight = img.height * demoWidth / img.width;
      setDemoCanvasWidth(demoWidth);
      setDemoCanvasHeight(demoHeight);
      const demoCanvas = demoCanvasRef.current;
      const demoCtx = demoCanvas.getContext('2d');
      demoCtx.drawImage(img, 0, 0, demoWidth, demoHeight);
      let watermarkSrc = getValues('watermark');
      if (!watermarkSrc) return;
      const watermarkColor = getValues('watermarkColor');
      if(getValues('watermarkEnableCustomColor') && watermarkColor) {
        const watermarkParts = watermarkSrc.split('data:image/svg+xml;base64,');
        if(watermarkParts.length > 1) {
          const watermarkBase64 = watermarkParts[1];
          const decodedString = atob(watermarkBase64).replace(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/gi, watermarkColor).replace('currentColor', watermarkColor);
          watermarkSrc = 'data:image/svg+xml;base64,' + btoa(decodedString);
        }
      }
      const watermarkImg = new Image();
      watermarkImg.src = watermarkSrc
      watermarkImg.onload = () => {
        drawWatermark(watermarkImg, ctx, canvas);
        drawWatermark(watermarkImg, demoCtx, demoCanvas);
      }
    }
  }, [getValues, canvasRef, drawWatermark]);

  const debouncedDraw = useCallback(debounce(drawImage, 300, { leading: false }), []);

  useEffect(() => {
    debouncedDraw();
  }, [canvasWidth, canvasHeight, drawImage, watchAllFields, debouncedDraw]);

  const imageField = register("image", { required: true });
  const watermarkField = register("watermark", { required: true });
  const watermarkCornerField = register("watermarkCorner", { required: true, validate: value => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value) });
  const watermarkOpacityField = register("watermarkOpacity", { required: true, validate: value => value >= 0 && value <= 100 });
  const watermarkScaleField = register("watermarkScale", { required: true, validate: value => value >= 0 && value <= 100 });
  const watermarkXOffsetField = register("watermarkXOffset", { required: true, validate: value => value >= 0 });
  const watermarkYOffsetField = register("watermarkYOffset", { required: true, validate: value => value >= 0 });
  const watermarkColorField = register("watermarkColor", { required: true });
  const watermarkEnableCustomColorField = register("watermarkEnableCustomColor", { required: true });

  const saveUserSettings = () => {
    const settings = {
      watermarkCorner: getValues('watermarkCorner'),
      watermarkXOffset: getValues('watermarkXOffset'),
      watermarkYOffset: getValues('watermarkYOffset'),
      watermarkScale: getValues('watermarkScale'),
      watermarkOpacity: getValues('watermarkOpacity'),
      watermarkColor: getValues('watermarkColor'),
      watermarkEnableCustomColor: getValues('watermarkEnableCustomColor'),
    }

    saveSettings(settings);
  }

  const downloadImage = () => {
    saveUserSettings();
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
      <UploadButtons imageField={imageField} watermarkField={watermarkField} setImage={(value, fileName) => { setValue('image', value); setImageFileName(fileName); }} setWatermark={value => setValue('watermark', value)} />
      <label className="block font-bold mb-2">{'Предпросмотр'}</label>
      <canvas hidden width={canvasWidth} height={canvasHeight} ref={canvasRef} className="m-auto" />
      <div className="border border-black border-dashed overflow-x-auto w-full" id='demoCanvasWrapper'>
        <canvas width={demoCanvasWidth} height={demoCanvasHeight} ref={demoCanvasRef} />
      </div>
      <ImageSettings
        setDefaultSettings={setDefaultSettings}
        getValues={getValues}
        watermarkCornerField={watermarkCornerField}
        watermarkOpacityField={watermarkOpacityField}
        watermarkScaleField={watermarkScaleField}
        watermarkXOffsetField={watermarkXOffsetField}
        watermarkYOffsetField={watermarkYOffsetField}
        watermarkEnableCustomColorField={watermarkEnableCustomColorField}
        setWatermarkColor={setWatermarkColor} />
      <button type="button" onClick={downloadImage} className="py-4 px-16 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Скачать</button>
    </form>
  )
}