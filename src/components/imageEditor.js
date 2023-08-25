import { useCallback, useEffect, useRef, useState } from "react";
import { ImageSettings } from "./imageSettings";
import { UploadButtons } from "./uploadButtons";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { useUserSettings } from "../hooks/useUserSettings";
import { useMemo } from "react";
import { fileSave } from "browser-fs-access";

export const ImageEditor = () => {
  const [userSettings, saveSettings] = useUserSettings();

  const defaultSettings = useMemo(() => ({
    image: '',
    watermark: '',
    watermarkCorner: 'bottom-right',
    watermarkXOffset: 10,
    watermarkYOffset: 10,
    watermarkScale: 30,
    watermarkOpacity: 30,
    watermarkColor: '#ffffff',
    watermarkEnableCustomColor: true,
  }), []);

  const { register, setValue, getValues, watch } = useForm({
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

  const [isSvgWatermark, setIsSvgWatermark] = useState(false);

  const applyWatermarkColor = useCallback(async () => {
    const color = getValues('watermarkColor');
    if (isSvgWatermark && getValues('watermarkEnableCustomColor') && color) {
      const watermarkSrc = getValues('watermark');
      const blob = await fetch(watermarkSrc).then(r => r.blob());
      const svg = await blob.text();
      const coloredSvg = svg.replace(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/gi, color).replace('currentColor', color);
      const coloredSvgBlob = new Blob([coloredSvg], { type: "image/svg+xml" });
      const coloredSvgUrl = URL.createObjectURL(coloredSvgBlob);
      setValue('watermark', coloredSvgUrl);
      console.log('coloredSvgUrl', coloredSvgUrl);
      URL.revokeObjectURL(watermarkSrc);
    }
  }, [getValues, isSvgWatermark, setValue]);

  useEffect(
    () => {
      applyWatermarkColor();
    },
    [isSvgWatermark, applyWatermarkColor]
  );

  const setWatermarkColor = useCallback((color) => {
    setValue('watermarkColor', color);
    applyWatermarkColor();
  }, [setValue, applyWatermarkColor]);

  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [demoCanvasWidth, setDemoCanvasWidth] = useState(300);
  const [demoCanvasHeight, setDemoCanvasHeight] = useState(300);
  const [imageFileName, setImageFileName] = useState('image');
  const watchAllFields = watch();

  const canvasRef = useRef(null);
  const demoCanvasRef = useRef(null);

  const drawWatermark = useCallback((watermarkImg, ctx, canvas) => {
    const watermarkScale = getValues('watermarkScale') / 100;
    const watermarkOpacity = getValues('watermarkOpacity') / 100;
    const watermarkXOffset = getValues('watermarkXOffset');
    const watermarkYOffset = getValues('watermarkYOffset');
    const watermarkCorner = getValues('watermarkCorner');
    ctx.globalAlpha = watermarkOpacity;
    const width = canvas.width * watermarkScale;
    const height = watermarkImg.height * width / watermarkImg.width;
    const xOffset = canvas.width * watermarkXOffset / 100;
    const yOffset = canvas.height * watermarkYOffset / 100;
    switch (watermarkCorner) {
      case 'top-left': {
        ctx.drawImage(
          watermarkImg,
          xOffset,
          yOffset,
          width,
          height);
        break;
      }
      case 'top-right': {
        ctx.drawImage(
          watermarkImg,
          canvas.width - width - xOffset,
          watermarkYOffset,
          width,
          height);
        break;
      }
      case 'bottom-left': {
        ctx.drawImage(
          watermarkImg,
          watermarkXOffset,
          canvas.height - height - yOffset,
          width,
          height);
        break;
      }
      case 'bottom-right': {
        ctx.drawImage(
          watermarkImg,
          canvas.width - width - xOffset,
          canvas.height - height - yOffset,
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
    const imageSrc = getValues('image');
    img.src = imageSrc;
    img.onload = () => {
      setCanvasWidth(img.width);
      setCanvasHeight(img.height);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const demoWidth = document.getElementById('demoCanvasWrapper').clientWidth;
      const demoHeight = img.height * demoWidth / img.width;
      setDemoCanvasWidth(demoWidth);
      setDemoCanvasHeight(demoHeight);
      const demoCanvas = demoCanvasRef.current;
      const demoCtx = demoCanvas.getContext('2d', { alpha: false });
      demoCtx.drawImage(img, 0, 0, demoWidth, demoHeight);

      let watermarkSrc = getValues('watermark');
      if (!watermarkSrc) return;
      const watermarkImg = new Image();
      watermarkImg.src = watermarkSrc;
      console.log('watermarkImg.src', watermarkImg.src);
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
  register("watermarkColor", { required: true });
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
    canvas.toBlob((blob) => {
      fileSave(blob, {
        fileName: `${imageFileName}_wm.png`,
        extensions: ['.png'],
      }).catch((err) => {
        console.log(err);
      });
    }, "image/png");
  }

  return (
    <form className="flex flex-col items-center my-8">
      <UploadButtons
        imageField={imageField}
        watermarkField={watermarkField}
        setImage={
          (value, fileName) => {
            URL.revokeObjectURL(getValues('image'));
            setValue('image', value);
            setImageFileName(fileName);
          }}
        setWatermark={
          (value, fileName, extension) => {
            URL.revokeObjectURL(getValues('watermark'));
            setValue('watermark', value);
            setIsSvgWatermark(extension.toLowerCase() === 'svg');
          }} />
      <label className="block font-bold mb-2">{'Предпросмотр'}</label>
      <canvas hidden width={canvasWidth} height={canvasHeight} ref={canvasRef} className="m-auto" />
      <div className="rounded shadow overflow-x-auto w-full max-w-lg" id='demoCanvasWrapper'>
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