'use client';

import { useState, ChangeEvent, useRef } from 'react';

type ConversionResult = {
  base64: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [base64Input, setBase64Input] = useState<string>('');
  const [decodedImage, setDecodedImage] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isPasting, setIsPasting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConversionResult(null);
    setCopySuccess(false);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConversion = () => {
    if (!imagePreview) return;
    
    setIsLoading(true);
    
    // 获取文件信息
    const input = document.getElementById('fileInput') as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      setTimeout(() => {
        setConversionResult({
          base64: imagePreview,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        setIsLoading(false);
      }, 500);
    }
  };

  const handleCopy = () => {
    if (!conversionResult) return;
    
    navigator.clipboard.writeText(conversionResult.base64)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('无法复制到剪贴板:', err);
      });
  };

  const handleDownload = () => {
    if (!conversionResult) return;
    
    const element = document.createElement('a');
    const file = new Blob([conversionResult.base64], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${conversionResult.fileName.split('.')[0]}_base64.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleBase64InputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBase64Input(e.target.value);
    setDecodeError(null);
  };

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      const clipboardText = await navigator.clipboard.readText();
      setBase64Input(clipboardText);
      setDecodeError(null);
      setIsPasting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('无法从剪贴板读取:', err);
      setIsPasting(false);
    }
  };

  const handleDecode = () => {
    if (!base64Input.trim()) {
      setDecodeError('请输入Base64编码');
      return;
    }

    try {
      // 尝试验证是否是有效的base64图片字符串
      let base64Data = base64Input.trim();
      
      // 如果没有包含数据类型前缀，尝试添加
      if (!base64Data.startsWith('data:image')) {
        base64Data = `data:image/png;base64,${base64Data.replace(/^data:image\/[a-z]+;base64,/, '')}`;
      }

      // 创建一个测试图像
      const img = new Image();
      img.onload = () => {
        setDecodedImage(base64Data);
        setDecodeError(null);
      };
      img.onerror = () => {
        setDecodeError('无效的Base64图片编码');
      };
      img.src = base64Data;
    } catch (err) {
      setDecodeError('无效的Base64图片编码');
    }
  };

  const handleImageDownload = () => {
    if (!decodedImage) return;

    const link = document.createElement('a');
    link.href = decodedImage;
    link.download = `decoded_image_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white text-center">图片与Base64编码转换工具</h1>
          <p className="text-white text-center mt-2">快速转换图片与Base64编码格式</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto pt-6 px-4">
        <div className="flex border-b border-gray-200 max-w-4xl mx-auto">
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'encode'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('encode')}
            aria-label="切换到图片转Base64编码功能"
            tabIndex={0}
          >
            图片转Base64编码
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'decode'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('decode')}
            aria-label="切换到Base64编码转图片功能"
            tabIndex={0}
          >
            Base64编码转图片
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="flex-grow container mx-auto py-4 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <div className="p-6">
            {activeTab === 'encode' ? (
              /* 图片转Base64编码功能 */
              <>
                {/* Upload Area */}
                <div className="mb-6">
                  <label 
                    htmlFor="fileInput" 
                    className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-lg text-gray-700 font-medium">点击上传图片或拖放图片到此处</p>
                      <p className="text-sm text-gray-500 mt-1">支持的格式: JPG, PNG, GIF, SVG, WEBP</p>
                    </div>
                    <input 
                      id="fileInput" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      aria-label="上传图片"
                    />
                  </label>
                </div>

                {/* Preview Area */}
                {imagePreview && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">图片预览</h2>
                    <div className="flex justify-center border rounded-lg overflow-hidden bg-gray-100 p-2">
                      <img 
                        src={imagePreview} 
                        alt="上传的图片预览" 
                        className="max-h-64 object-contain"
                      />
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleConversion}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="转换图片为Base64"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            转换中...
                          </span>
                        ) : '转换为Base64'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Result Area */}
                {conversionResult && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">转换结果</h2>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">文件名: {conversionResult.fileName}</p>
                        <p className="text-sm text-gray-500">文件大小: {(conversionResult.fileSize / 1024).toFixed(2)} KB</p>
                        <p className="text-sm text-gray-500">文件类型: {conversionResult.fileType}</p>
                      </div>
                      <div className="relative">
                        <textarea 
                          value={conversionResult.base64} 
                          readOnly 
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Base64编码结果"
                          tabIndex={0}
                        />
                        <div className="absolute bottom-4 right-4 space-x-2">
                          <button
                            onClick={handleCopy}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm transition-colors"
                            aria-label="复制Base64编码"
                            tabIndex={0}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            {copySuccess ? '已复制!' : '复制'}
                          </button>
                          <button
                            onClick={handleDownload}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm transition-colors"
                            aria-label="下载Base64编码为文本文件"
                            tabIndex={0}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            下载
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Base64编码转图片功能 */
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">粘贴Base64编码</h2>
                  <div className="relative">
                    <textarea 
                      ref={textareaRef}
                      value={base64Input} 
                      onChange={handleBase64InputChange}
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="在此粘贴Base64编码..."
                      aria-label="Base64编码输入"
                      tabIndex={0}
                    />
                    <button
                      onClick={handlePaste}
                      disabled={isPasting}
                      className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm transition-colors"
                      aria-label="从剪贴板粘贴"
                      tabIndex={0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {isPasting ? '粘贴中...' : '一键粘贴'}
                    </button>
                  </div>
                  {decodeError && (
                    <p className="text-red-500 text-sm mt-2">{decodeError}</p>
                  )}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleDecode}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      aria-label="转换Base64为图片"
                      tabIndex={0}
                    >
                      转换为图片
                    </button>
                  </div>
                </div>

                {/* 图片预览区域 */}
                {decodedImage && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">图片预览</h2>
                    <div className="flex flex-col items-center border rounded-lg overflow-hidden bg-gray-100 p-4">
                      <img 
                        src={decodedImage} 
                        alt="解码后的图片" 
                        className="max-h-64 object-contain mb-4"
                      />
                      <button
                        onClick={handleImageDownload}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                        aria-label="下载图片"
                        tabIndex={0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        下载图片
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-6 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-300">图片与Base64编码转换工具 © {new Date().getFullYear()}</p>
          <p className="text-gray-400 text-sm mt-1">方便快捷地在图片与Base64编码格式之间转换</p>
        </div>
      </footer>
    </main>
  );
}
