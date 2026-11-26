import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { ApiKeysModal } from './components/ApiKeysModal';
import { DiscoverView } from './components/DiscoverView';
import { ImagineCanvas } from './components/ImagineCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibraryView } from './components/LibraryView';
import { LightboxModal } from './components/LightboxModal';
import { MetaHaloLogo } from './components/MetaHaloLogo';
import { MetaSidebar } from './components/MetaSidebar';
import { Omnibox } from './components/Omnibox';
import {
  ASPECT_RATIOS,
  PROVIDERS,
  QUICK_SUGGESTION_CHIPS,
  STYLE_PRESETS,
} from './data/presets';
import { generateImage } from './services/imageProviders';
import {
  clearAllImages,
  deleteImageRecord,
  deleteThreadRecord,
  loadApiKeys,
  loadSavedImages,
  loadSavedThreads,
  loadTheme,
  saveApiKeys,
  saveImageRecord,
  saveTheme,
  saveThreadRecord,
} from './services/storage';
import {
  ActiveJob,
  ApiKeys,
  AttachedImage,
  GeneratedImage,
  ImagineThread,
  ImagineTurn,
  InspirationItem,
  MainView,
  ProviderId,
  ThemeMode,
} from './types/studio';
import {
  composeFinalPrompt,
  downloadImageFile,
  enhancePromptText,
} from './utils/promptEnhance';
import { LogoRemovalMode, removeCornerLogo } from './utils/logoRemover';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeView, setActiveView] = useState<MainView>('imagine');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [providerId, setProviderId] = useState<ProviderId>('pollinations-free');
  const [modelId, setModelId] = useState<string>(PROVIDERS[0].models[0].id);
  const [aspectRatioId, setAspectRatioId] = useState<string>('1:1');
  const [styleId, setStyleId] = useState<string>('cinematic');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [promptMagic, setPromptMagic] = useState<boolean>(true);
  const [autoRemoveLogo, setAutoRemoveLogo] = useState<boolean>(true);
  const [logoRemovalMode, setLogoRemovalMode] =
    useState<LogoRemovalMode>('inpaint');
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>(
    'blurry, low quality, distorted anatomy, watermark'
  );
  const [seed, setSeed] = useState<string>('');
  const [lockSeed, setLockSeed] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => loadApiKeys());
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [threads, setThreads] = useState<ImagineThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);

  const [inspectedImage, setInspectedImage] = useState<GeneratedImage | null>(
    null
  );
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(
    null
  );
  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Apply light/dark root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  // Load persisted images & threads from IndexedDB
  useEffect(() => {
    Promise.all([loadSavedImages(), loadSavedThreads()]).then(
      ([savedImages, savedThreads]) => {
        setImages(savedImages);
        setThreads(savedThreads);
      }
    );
  }, []);

  const imagesById = useMemo(() => {
    const map: Record<string, GeneratedImage> = {};
    for (const img of images) map[img.id] = img;
    return map;
  }, [images]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const currentProvider = useMemo(
    () => PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0],
    [providerId]
  );

  const currentModel = useMemo(
    () =>
      currentProvider.models.find((m) => m.id === modelId) ||
      currentProvider.models[0],
    [currentProvider, modelId]
  );

  const currentAspectRatio = useMemo(
    () =>
      ASPECT_RATIOS.find((ar) => ar.id === aspectRatioId) || ASPECT_RATIOS[0],
    [aspectRatioId]
  );

  const currentStyle = useMemo(
    () => STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0],
    [styleId]
  );

  const isGenerating = useMemo(
    () => activeJobs.some((j) => !j.error),
    [activeJobs]
  );

  const favoriteCount = useMemo(
    () => images.filter((i) => i.favorite).length,
    [images]
  );

  const handleProviderChange = (nextId: ProviderId) => {
    setProviderId(nextId);
    const provider = PROVIDERS.find((p) => p.id === nextId);
    if (provider?.models[0]) setModelId(provider.models[0].id);
  };

  const handleSaveApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    saveApiKeys(keys);
    showToast('Đã lưu API Keys an toàn trên trình duyệt');
  };

  const handleNewThread = () => {
    setActiveThreadId(null);
    setActiveView('imagine');
    setInspectedImage(null);
    setAttachedImage(null);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    setActiveView('imagine');
  };

  const handleDeleteThread = async (id: string) => {
    await deleteThreadRecord(id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) setActiveThreadId(null);
    showToast('Đã xóa phiên sáng tạo');
  };

  const runGeneration = useCallback(
    async (options?: {
      promptText?: string;
      displayPrompt?: string;
      contextNote?: string;
      styleOverrideId?: string;
      aspectRatioOverrideId?: string;
      forceNewThread?: boolean;
      referenceOverride?: AttachedImage | null;
    }) => {
      const rawInput = (options?.promptText ?? prompt).trim();
      if (!rawInput) return;

      if (currentProvider.requiresKey) {
        const missing =
          (providerId === 'pollinations-pro' && !apiKeys.pollinationsKey.trim()) ||
          (providerId === 'gemini' && !apiKeys.geminiKey.trim()) ||
          (providerId === 'openai' && !apiKeys.openaiKey.trim()) ||
          (providerId === 'huggingface' && !apiKeys.huggingfaceKey.trim());
        if (missing) {
          setApiModalOpen(true);
          showToast(`Vui lòng nhập API Key cho ${currentProvider.shortName}`);
          return;
        }
      }

      const styleObj =
        STYLE_PRESETS.find(
          (s) => s.id === (options?.styleOverrideId ?? styleId)
        ) || currentStyle;
      const ratioObj =
        ASPECT_RATIOS.find(
          (r) => r.id === (options?.aspectRatioOverrideId ?? aspectRatioId)
        ) || currentAspectRatio;

      const refImage =
        options?.referenceOverride !== undefined
          ? options.referenceOverride
          : attachedImage;

      // Build thread & conversational context
      const existingThread =
        options?.forceNewThread ? null : activeThread;
      const threadId = existingThread?.id ?? `thread-${Date.now()}`;
      const turnId = `turn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // If user writes a short follow-up edit inside an ongoing thread (without forcing new thread),
      // gently blend previous scene context for Text-to-Image models
      const prevTurn =
        existingThread && existingThread.turns.length > 0
          ? existingThread.turns[existingThread.turns.length - 1]
          : null;

      let effectivePrompt = rawInput;
      let contextNote = options?.contextNote;

      if (
        !options?.promptText &&
        prevTurn &&
        rawInput.split(/\s+/).length <= 14 &&
        !refImage
      ) {
        effectivePrompt = `${prevTurn.prompt}, modified: ${rawInput}`;
        contextNote = 'Tiếp nối ngữ cảnh phiên trước';
      }

      const finalPrompt = composeFinalPrompt(
        effectivePrompt,
        styleObj,
        promptMagic
      );

      const newTurn: ImagineTurn = {
        id: turnId,
        prompt: options?.displayPrompt ?? rawInput,
        contextNote,
        attachedImage: refImage ?? undefined,
        styleName: styleObj.name,
        aspectRatio: ratioObj.id,
        modelLabel: currentModel.label,
        providerName: currentProvider.shortName,
        createdAt: Date.now(),
        imageIds: [],
      };

      const updatedThread: ImagineThread = existingThread
        ? {
            ...existingThread,
            updatedAt: Date.now(),
            turns: [...existingThread.turns, newTurn],
          }
        : {
            id: threadId,
            title: (options?.displayPrompt ?? rawInput).slice(0, 44),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            turns: [newTurn],
          };

      setThreads((prev) => {
        const without = prev.filter((t) => t.id !== threadId);
        return [updatedThread, ...without];
      });
      await saveThreadRecord(updatedThread);

      setActiveThreadId(threadId);
      setActiveView('imagine');
      if (!options?.promptText) {
        setPrompt('');
        setAttachedImage(null);
      }

      const baseSeed =
        lockSeed && seed.trim()
          ? Number(seed.trim())
          : Math.floor(Math.random() * 2147483647);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const batchSeeds = Array.from({ length: batchCount }, (_, idx) =>
        idx === 0 ? baseSeed : (baseSeed + idx * 7919) % 2147483647
      );

      const newJobs: ActiveJob[] = batchSeeds.map((_, idx) => ({
        id: `job-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        threadId,
        turnId,
        prompt: options?.displayPrompt ?? rawInput,
        aspectRatio: ratioObj.id,
        width: ratioObj.width,
        height: ratioObj.height,
        providerName: currentProvider.shortName,
        modelLabel: currentModel.label,
        statusText:
          idx === 0
            ? `Đang tưởng tượng với ${currentModel.label}...`
            : 'Đang chờ lượt tạo...',
        progress: 14,
        startedAt: Date.now(),
      }));

      setActiveJobs((prev) => [...newJobs, ...prev.filter((j) => !j.error)]);

      const runSingleJob = async (job: ActiveJob, jobSeed: number) => {
        const startTime = Date.now();
        try {
          const result = await generateImage({
            providerId,
            modelId: currentModel.id,
            prompt: finalPrompt,
            negativePrompt: negativePrompt.trim(),
            aspectRatio: ratioObj,
            seed: jobSeed,
            apiKeys,
            referenceImage: refImage ?? undefined,
            signal: controller.signal,
            onStatus: (statusText, progress) => {
              setActiveJobs((prev) =>
                prev.map((j) =>
                  j.id === job.id ? { ...j, statusText, progress } : j
                )
              );
            },
          });

          let finalImageUrl = result.imageUrl;
          let logoCleaned = false;

          if (autoRemoveLogo) {
            setActiveJobs((prev) =>
              prev.map((j) =>
                j.id === job.id
                  ? {
                      ...j,
                      statusText: 'Đang tự động xóa logo góc ảnh...',
                      progress: 96,
                    }
                  : j
              )
            );
            try {
              finalImageUrl = await removeCornerLogo(
                result.imageUrl,
                logoRemovalMode
              );
              logoCleaned = true;
            } catch {
              // Keep original image if canvas cleaning fails
            }
          }

          const created: GeneratedImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            threadId,
            turnId,
            url: finalImageUrl,
            prompt: effectivePrompt,
            finalPrompt,
            negativePrompt: negativePrompt.trim(),
            providerId,
            providerName: currentProvider.shortName,
            modelId: currentModel.id,
            modelLabel: currentModel.label,
            styleId: styleObj.id,
            styleName: styleObj.name,
            aspectRatio: ratioObj.id,
            width: result.width,
            height: result.height,
            seed: result.seed,
            createdAt: Date.now(),
            durationMs: Date.now() - startTime,
            favorite: false,
            logoCleaned,
          };

          await saveImageRecord(created);
          setImages((prev) => [created, ...prev]);

          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== threadId) return t;
              const nextThread: ImagineThread = {
                ...t,
                updatedAt: Date.now(),
                turns: t.turns.map((turn) =>
                  turn.id === turnId
                    ? { ...turn, imageIds: [...turn.imageIds, created.id] }
                    : turn
                ),
              };
              saveThreadRecord(nextThread);
              return nextThread;
            })
          );

          setActiveJobs((prev) => prev.filter((j) => j.id !== job.id));
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setActiveJobs((prev) => prev.filter((j) => j.id !== job.id));
            return;
          }
          const message =
            err instanceof Error
              ? err.message
              : 'Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại.';
          setActiveJobs((prev) =>
            prev.map((j) => (j.id === job.id ? { ...j, error: message } : j))
          );
        }
      };

      if (providerId === 'pollinations-free' && newJobs.length > 1) {
        for (let i = 0; i < newJobs.length; i++) {
          if (controller.signal.aborted) break;
          await runSingleJob(newJobs[i], batchSeeds[i]);
        }
      } else {
        await Promise.all(
          newJobs.map((job, idx) => runSingleJob(job, batchSeeds[idx]))
        );
      }
    },
    [
      prompt,
      currentProvider,
      providerId,
      apiKeys,
      styleId,
      currentStyle,
      aspectRatioId,
      currentAspectRatio,
      attachedImage,
      activeThread,
      promptMagic,
      autoRemoveLogo,
      logoRemovalMode,
      currentModel,
      lockSeed,
      seed,
      batchCount,
      negativePrompt,
      showToast,
    ]
  );

  const handleCancelGeneration = () => {
    abortControllerRef.current?.abort();
    setActiveJobs((prev) => prev.filter((j) => Boolean(j.error)));
    showToast('Đã dừng tác vụ đang tạo');
  };

  const handleMagicEnhance = () => {
    if (!prompt.trim()) return;
    setPrompt(enhancePromptText(prompt, currentStyle));
    showToast('Đã nâng cấp Prompt chi tiết hơn');
  };

  const handleToggleFavorite = async (id: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;
        const updated = { ...img, favorite: !img.favorite };
        saveImageRecord(updated);
        if (inspectedImage?.id === id) setInspectedImage(updated);
        if (fullscreenImage?.id === id) setFullscreenImage(updated);
        return updated;
      })
    );
  };

  const handleDeleteImage = async (id: string) => {
    await deleteImageRecord(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (inspectedImage?.id === id) setInspectedImage(null);
    if (fullscreenImage?.id === id) setFullscreenImage(null);
    showToast('Đã xóa ảnh');
  };

  const handleClearAllImages = async () => {
    if (!window.confirm('Xóa toàn bộ ảnh đã tạo khỏi thư viện cục bộ?')) return;
    await clearAllImages();
    setImages([]);
    setInspectedImage(null);
    setFullscreenImage(null);
    showToast('Đã dọn sạch thư viện');
  };

  const handleDownloadImage = (img: GeneratedImage) => {
    downloadImageFile(img.url, img.prompt);
    showToast('Đang tải ảnh xuống máy...');
  };

  const handleCleanExistingImage = async (
    img: GeneratedImage,
    mode: LogoRemovalMode
  ) => {
    try {
      const cleanedUrl = await removeCornerLogo(img.url, mode);
      const updated: GeneratedImage = {
        ...img,
        url: cleanedUrl,
        logoCleaned: true,
      };
      await saveImageRecord(updated);
      setImages((prev) =>
        prev.map((item) => (item.id === img.id ? updated : item))
      );
      if (inspectedImage?.id === img.id) setInspectedImage(updated);
      if (fullscreenImage?.id === img.id) setFullscreenImage(updated);
      showToast(
        mode === 'inpaint'
          ? 'Đã xóa logo góc ảnh bằng Inpaint thông minh'
          : 'Đã cắt sạch mép logo giữ nguyên tỉ lệ'
      );
    } catch {
      showToast('Không thể xóa logo cho ảnh này');
    }
  };

  const handleEditFromImage = (img: GeneratedImage) => {
    const mimeMatch = img.url.match(/^data:(image\/[a-zA-Z0-9+.-]+);/);
    setAttachedImage({
      dataUrl: img.url,
      mimeType: mimeMatch?.[1] || 'image/png',
      name: `${img.modelLabel} (${img.aspectRatio})`,
    });
    setPrompt('');
    setActiveView('imagine');
    showToast('Đã gắn ảnh vào Omnibox — hãy nhập yêu cầu chỉnh sửa');
  };

  const handleRemixImage = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setStyleId(img.styleId || 'none');
    setAspectRatioId(img.aspectRatio || '1:1');
    if (img.negativePrompt) setNegativePrompt(img.negativePrompt);
    setSeed(String(img.seed));
    setActiveView('imagine');
    showToast('Đã nạp lại Prompt & thông số để Remix');
  };

  const handleQuickSuggestion = (
    chip: (typeof QUICK_SUGGESTION_CHIPS)[number]
  ) => {
    setStyleId(chip.styleId);
    setAspectRatioId(chip.aspectRatio);
    runGeneration({
      promptText: chip.prompt,
      displayPrompt: chip.prompt,
      styleOverrideId: chip.styleId,
      aspectRatioOverrideId: chip.aspectRatio,
    });
  };

  const handleQuickFollowUp = (
    basePrompt: string,
    instruction: string,
    label: string,
    overrideStyle?: string
  ) => {
    const nextPrompt = instruction
      ? `${basePrompt}, ${instruction}`
      : basePrompt;
    if (overrideStyle) setStyleId(overrideStyle);
    runGeneration({
      promptText: nextPrompt,
      displayPrompt: label,
      contextNote: `Chỉnh sửa nhanh • ${label}`,
      styleOverrideId: overrideStyle ?? styleId,
    });
  };

  const handleDiscoverImagine = (
    item: InspirationItem,
    autoGenerate: boolean
  ) => {
    setStyleId(item.styleId);
    setAspectRatioId(item.aspectRatio);
    if (autoGenerate) {
      runGeneration({
        promptText: item.prompt,
        displayPrompt: item.prompt,
        styleOverrideId: item.styleId,
        aspectRatioOverrideId: item.aspectRatio,
        forceNewThread: true,
      });
    } else {
      setPrompt(item.prompt);
      setActiveThreadId(null);
      setActiveView('imagine');
      showToast(`Đã điền ý tưởng "${item.title}"`);
    }
  };

  const handleSwitchToAiHorde = () => {
    handleProviderChange('aihorde-free');
    showToast('Đã chuyển sang AI Horde GPU Cộng đồng (Miễn phí)');
  };

  const isThreadEmpty = !activeThread || activeThread.turns.length === 0;

  const omniboxElement = (
    <Omnibox
      prompt={prompt}
      onPromptChange={setPrompt}
      onSubmit={() => runGeneration()}
      onCancel={handleCancelGeneration}
      onMagicEnhance={handleMagicEnhance}
      isGenerating={isGenerating}
      providerId={providerId}
      onProviderChange={handleProviderChange}
      modelId={currentModel.id}
      onModelChange={setModelId}
      aspectRatioId={aspectRatioId}
      onAspectRatioChange={setAspectRatioId}
      styleId={styleId}
      onStyleChange={setStyleId}
      batchCount={batchCount}
      onBatchCountChange={setBatchCount}
      promptMagic={promptMagic}
      onPromptMagicChange={setPromptMagic}
      autoRemoveLogo={autoRemoveLogo}
      onAutoRemoveLogoChange={setAutoRemoveLogo}
      logoRemovalMode={logoRemovalMode}
      onLogoRemovalModeChange={setLogoRemovalMode}
      negativePrompt={negativePrompt}
      onNegativePromptChange={setNegativePrompt}
      seed={seed}
      onSeedChange={setSeed}
      lockSeed={lockSeed}
      onLockSeedChange={setLockSeed}
      attachedImage={attachedImage}
      onAttachImage={setAttachedImage}
      apiKeys={apiKeys}
      onOpenApiKeys={() => setApiModalOpen(true)}
      popoverDirection={isThreadEmpty ? 'down' : 'up'}
      isFollowUpMode={!isThreadEmpty}
    />
  );

  return (
    <div className="meta-canvas-bg flex min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden">
      {/* Left Collapsible Meta AI Navigation Rail */}
      <MetaSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        totalImages={images.length}
        favoriteCount={favoriteCount}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }
        apiKeys={apiKeys}
        onOpenApiKeys={() => setApiModalOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Central Stage */}
      <div className="flex min-w-0 flex-1 flex-col lg:h-screen lg:overflow-hidden">
        {/* Compact Mobile Top Bar */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl lg:hidden"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNewThread}
            className="flex items-center gap-2"
          >
            <MetaHaloLogo size="sm" />
            <span className="font-display text-sm font-bold text-[var(--text-primary)]">
              Lumina AI
            </span>
          </button>
          <div className="w-9" />
        </header>

        <main className="min-w-0 flex-1 lg:overflow-hidden">
          {activeView === 'imagine' && (
            <ImagineCanvas
              thread={activeThread}
              imagesById={imagesById}
              activeJobs={activeJobs.filter(
                (j) => !activeThreadId || j.threadId === activeThreadId
              )}
              selectedImageId={inspectedImage?.id ?? null}
              onSelectImage={setInspectedImage}
              onToggleFavorite={handleToggleFavorite}
              onDownloadImage={handleDownloadImage}
              onEditFromImage={handleEditFromImage}
              onQuickSuggestion={handleQuickSuggestion}
              onQuickFollowUp={handleQuickFollowUp}
              onDismissJobError={(id) =>
                setActiveJobs((prev) => prev.filter((j) => j.id !== id))
              }
              onSwitchToAiHorde={handleSwitchToAiHorde}
              omniboxNode={omniboxElement}
            />
          )}

          {activeView === 'discover' && (
            <div className="h-full overflow-y-auto">
              <DiscoverView onImagineItem={handleDiscoverImagine} />
            </div>
          )}

          {(activeView === 'library' || activeView === 'favorites') && (
            <div className="h-full overflow-y-auto">
              <LibraryView
                mode={activeView}
                images={images}
                selectedImageId={inspectedImage?.id ?? null}
                onSelectImage={setInspectedImage}
                onToggleFavorite={handleToggleFavorite}
                onDownload={handleDownloadImage}
                onEditFromImage={handleEditFromImage}
                onDelete={handleDeleteImage}
                onClearAll={handleClearAllImages}
                onStartImagine={handleNewThread}
              />
            </div>
          )}
        </main>
      </div>

      {/* Right Contextual Inspector Panel (Meta AI style) */}
      <InspectorPanel
        image={inspectedImage}
        onClose={() => setInspectedImage(null)}
        onOpenFullscreen={setFullscreenImage}
        onDownload={handleDownloadImage}
        onToggleFavorite={handleToggleFavorite}
        onEditFromImage={handleEditFromImage}
        onCleanLogo={handleCleanExistingImage}
        onRemix={handleRemixImage}
        onDelete={handleDeleteImage}
      />

      {/* Fullscreen Lightbox */}
      <LightboxModal
        image={fullscreenImage}
        images={images}
        onClose={() => setFullscreenImage(null)}
        onSelectImage={setFullscreenImage}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownloadImage}
        onRemix={handleRemixImage}
        onDelete={handleDeleteImage}
      />

      {/* API Keys Modal */}
      <ApiKeysModal
        open={apiModalOpen}
        apiKeys={apiKeys}
        onSave={handleSaveApiKeys}
        onClose={() => setApiModalOpen(false)}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
