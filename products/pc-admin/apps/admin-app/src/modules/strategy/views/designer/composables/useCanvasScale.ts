import { ref, computed, watch, type Ref } from 'vue';

/**
 * 画布缩放管理
 */
export function useCanvasScale(panX: Ref<number>, panY: Ref<number>) {
  // 画布缩放状态
  const canvasScale = ref(1); // 缩放比例，1 = 100%
  const minScale = 1; // 最小缩放比例（100%）
  const maxScale = 3; // 最大缩放比例（300%）
  const scaleStep = 0.1; // 每次缩放步长

  // 缩放输入框状态
  const scaleInputValue = ref('100%');
  const isInputFocused = ref(false);

  // 计算缩放百分比显示
  const scalePercentage = computed(() => {
    return Math.round(canvasScale.value * 100);
  });

  // 更新输入框显示值
  const updateScaleInputValue = () => {
    if (!isInputFocused.value) {
      scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
    }
  };

  // 应用输入框的缩放值
  const applyScaleFromInput = () => {
    let inputValue = scaleInputValue.value.trim();

    // 如果输入值不包含百分号，自动添加
    if (!inputValue.includes('%')) {
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue) && numericValue > 0) {
        inputValue = `${numericValue}%`;
      }
    }

    // 移除百分号进行数值计算
    const numericValue = parseFloat(inputValue.replace('%', ''));

    if (!isNaN(numericValue) && numericValue > 0) {
      const scale = numericValue / 100;
      canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
    }

    // 更新显示值，确保有百分号
    scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
  };

  // 缩放控制函数
  const handleZoomIn = () => {
    if (canvasScale.value < maxScale) {
      canvasScale.value = Math.min(canvasScale.value + scaleStep, maxScale);
      updateScaleInputValue();
    }
  };

  const handleZoomOut = () => {
    if (canvasScale.value > minScale) {
      canvasScale.value = Math.max(canvasScale.value - scaleStep, minScale);
      updateScaleInputValue();
    }
  };

  const handleFitToScreen = () => {
    canvasScale.value = minScale; // 重置为100%
    panX.value = 0; // 重置拖拽位置
    panY.value = 0;
    updateScaleInputValue();
  };

  // 处理缩放下拉菜单命令
  const handleZoomCommand = (command: string) => {
    if (command === 'fit') {
      handleFitToScreen();
    } else {
      const scale = parseInt(command) / 100;
      canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
      updateScaleInputValue();
    }
  };

  // 处理输入框内容变化
  const handleScaleInputChange = (value: string) => {
    // 如果用户删除了百分号，不自动添加
    // 如果用户输入了纯数字，也不自动添加百分号
    // 只有在失焦或回车时才处理
  };

  // 处理输入框失焦
  const handleScaleInputBlur = () => {
    isInputFocused.value = false;
    applyScaleFromInput();
  };

  // 处理输入框回车
  const handleScaleInputEnter = () => {
    isInputFocused.value = false;
    applyScaleFromInput();
  };

  // 监听缩放变化，同步输入框值
  watch(canvasScale, () => {
    updateScaleInputValue();
  });

  return {
    canvasScale,
    minScale,
    maxScale,
    scaleStep,
    scaleInputValue,
    isInputFocused,
    scalePercentage,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleZoomCommand,
    updateScaleInputValue,
    handleScaleInputChange,
    handleScaleInputBlur,
    handleScaleInputEnter
  };
}
