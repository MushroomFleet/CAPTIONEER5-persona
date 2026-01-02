import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';

// ═══════════════════════════════════════════════════════════════════════════════
// CAPTIONEER - Batch Image Captioning Tool
// Industrial/Utilitarian Design Aesthetic
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SYSTEM_PROMPT = `You are an expert image captioner. Write a detailed description of the image inside a single paragraph, with no feedback or commentary.`;

const STORAGE_KEYS = {
  SYSTEM_PROMPT: 'captioneer_system_prompt',
  API_KEY: 'captioneer_api_key',
  MODEL: 'captioneer_model',
  TRIGGER: 'captioneer_trigger',
  CLASSIFIER: 'captioneer_classifier',
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0b 0%, #141416 50%, #0d0d0f 100%)',
    fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
    color: '#e8e8e8',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  
  noiseOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    opacity: 0.03,
    pointerEvents: 'none',
    zIndex: 0,
  },
  
  gridLines: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 30px',
  },
  
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '50px',
    paddingBottom: '30px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
  },
  
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #ffffff 0%, #a0a0a0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  
  version: {
    fontSize: '11px',
    color: '#666',
    marginLeft: '12px',
    padding: '3px 8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    letterSpacing: '1px',
  },
  
  settingsBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 20px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px',
  },
  
  panel: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '28px',
    position: 'relative',
  },
  
  panelFull: {
    gridColumn: '1 / -1',
  },
  
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  
  panelNumber: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#000',
  },
  
  panelTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  
  panelSubtitle: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  
  uploadZone: {
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(0,0,0,0.2)',
  },
  
  uploadZoneActive: {
    borderColor: '#ff6b35',
    background: 'rgba(255, 107, 53, 0.05)',
  },
  
  uploadZoneLocked: {
    borderColor: '#22c55e',
    borderStyle: 'solid',
    background: 'rgba(34, 197, 94, 0.05)',
  },
  
  uploadIcon: {
    fontSize: '32px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  
  uploadText: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '8px',
  },
  
  uploadHint: {
    fontSize: '11px',
    color: '#555',
  },
  
  lockedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  
  unlockBtn: {
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    marginTop: '12px',
    transition: 'all 0.2s ease',
  },
  
  inputGroup: {
    marginBottom: '20px',
  },
  
  inputLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  
  inputFocused: {
    borderColor: '#ff6b35',
    boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
  },
  
  textarea: {
    resize: 'vertical',
    minHeight: '120px',
  },
  
  folderSelect: {
    display: 'flex',
    gap: '12px',
  },
  
  folderInput: {
    flex: 1,
  },
  
  browseBtn: {
    background: 'rgba(255, 107, 53, 0.1)',
    border: '1px solid rgba(255, 107, 53, 0.3)',
    color: '#ff6b35',
    padding: '14px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  
  fileList: {
    marginTop: '16px',
    maxHeight: '200px',
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '12px',
  },
  
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontSize: '12px',
  },
  
  fileIcon: {
    width: '24px',
    height: '24px',
    background: 'rgba(255, 107, 53, 0.1)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
  },
  
  fileName: {
    flex: 1,
    color: '#aaa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  
  fileSize: {
    color: '#555',
    fontSize: '11px',
  },
  
  startBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '20px 40px',
    color: '#000',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 30px rgba(255, 107, 53, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  
  startBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  
  progressPanel: {
    background: 'rgba(255, 107, 53, 0.03)',
    border: '1px solid rgba(255, 107, 53, 0.15)',
    borderRadius: '12px',
    padding: '28px',
    marginTop: '30px',
  },
  
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  
  progressTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ff6b35',
  },
  
  progressCount: {
    fontSize: '13px',
    color: '#888',
  },
  
  progressBar: {
    height: '8px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  
  logContainer: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '16px',
    maxHeight: '200px',
    overflowY: 'auto',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '11px',
  },
  
  logEntry: {
    padding: '4px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    gap: '12px',
  },
  
  logTime: {
    color: '#555',
    flexShrink: 0,
  },
  
  logMessage: {
    color: '#888',
  },
  
  logSuccess: {
    color: '#22c55e',
  },
  
  logError: {
    color: '#ef4444',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  
  modal: {
    background: 'linear-gradient(135deg, #1a1a1c 0%, #141416 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '36px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },
  
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  
  saveBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    color: '#000',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginTop: '24px',
    transition: 'all 0.2s ease',
  },
  
  downloadBtn: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '20px 40px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 4px 30px rgba(34, 197, 94, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '20px',
    width: '100%',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '20px',
  },
  
  statCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ff6b35',
  },
  
  statLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const isVideoFile = (filename) => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

const getBaseName = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const extractFrame15FromVideo = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      // Calculate time for frame 15 (assuming ~30fps)
      const fps = 30;
      const targetTime = 15 / fps; // ~0.5 seconds
      
      video.currentTime = Math.min(targetTime, video.duration);
    };
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        resolve(blob);
      }, 'image/jpeg', 0.95);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Captioneer() {
  // State management
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isPromptLocked, setIsPromptLocked] = useState(false);
  const [promptFileName, setPromptFileName] = useState('');
  
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('x-ai/grok-4-fast');
  const [showSettings, setShowSettings] = useState(false);
  
  const [triggerWord, setTriggerWord] = useState('');
  const [classifier, setClassifier] = useState('');
  
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const [stats, setStats] = useState({ success: 0, failed: 0, time: 0 });
  
  const fileInputRef = useRef(null);
  const promptInputRef = useRef(null);
  const logContainerRef = useRef(null);
  const zipRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT);
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
    const savedTrigger = localStorage.getItem(STORAGE_KEYS.TRIGGER);
    const savedClassifier = localStorage.getItem(STORAGE_KEYS.CLASSIFIER);
    
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
      setIsPromptLocked(true);
      setPromptFileName('Loaded from storage');
    }
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModel(savedModel);
    if (savedTrigger) setTriggerWord(savedTrigger);
    if (savedClassifier) setClassifier(savedClassifier);
  }, []);
  
  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  
  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [...prev, { time: formatTime(), message, type }]);
  }, []);
  
  const handlePromptUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setSystemPrompt(content);
      setPromptFileName(file.name);
      setIsPromptLocked(false);
    };
    reader.readAsText(file);
  };
  
  const lockPrompt = () => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, systemPrompt);
    setIsPromptLocked(true);
    addLog(`System prompt locked: "${promptFileName}"`, 'success');
  };
  
  const unlockPrompt = () => {
    localStorage.removeItem(STORAGE_KEYS.SYSTEM_PROMPT);
    setIsPromptLocked(false);
    setSystemPrompt('');
    setPromptFileName('');
    addLog('System prompt unlocked and cleared', 'info');
  };
  
  const handleFilesSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(f => isImageFile(f.name) || isVideoFile(f.name));
    setFiles(validFiles);
    addLog(`Selected ${validFiles.length} files for processing`, 'info');
  };
  
  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
    setShowSettings(false);
    addLog('Settings saved', 'success');
  };
  
  const savePrefixes = () => {
    localStorage.setItem(STORAGE_KEYS.TRIGGER, triggerWord);
    localStorage.setItem(STORAGE_KEYS.CLASSIFIER, classifier);
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CAPTIONING API
  // ─────────────────────────────────────────────────────────────────────────────
  
  const captionImage = async (base64Image, mimeType = 'image/jpeg') => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Captioneer',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt || DEFAULT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
              {
                type: 'text',
                text: 'Please describe this image.',
              },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PROCESSING
  // ─────────────────────────────────────────────────────────────────────────────
  
  const processFiles = async () => {
    if (!apiKey) {
      addLog('Error: API key not configured', 'error');
      setShowSettings(true);
      return;
    }
    
    if (files.length === 0) {
      addLog('Error: No files selected', 'error');
      return;
    }
    
    setIsProcessing(true);
    setIsComplete(false);
    setProgress({ current: 0, total: files.length });
    setResults([]);
    setLogs([]);
    startTimeRef.current = Date.now();
    
    savePrefixes();
    addLog(`Starting batch processing of ${files.length} files...`, 'info');
    addLog(`Model: ${model}`, 'info');
    
    const zip = new JSZip();
    zipRef.current = zip;
    
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const baseName = getBaseName(file.name);
      
      try {
        addLog(`Processing: ${file.name}`, 'info');
        
        let base64Image;
        let mimeType = 'image/jpeg';
        
        if (isVideoFile(file.name)) {
          addLog(`  → Extracting frame 15 from video...`, 'info');
          const frameBlob = await extractFrame15FromVideo(file);
          base64Image = await blobToBase64(frameBlob);
        } else {
          mimeType = file.type || 'image/jpeg';
          base64Image = await fileToBase64(file);
        }
        
        addLog(`  → Sending to vision API...`, 'info');
        const caption = await captionImage(base64Image, mimeType);
        
        // Build final caption with trigger + classifier
        const parts = [];
        if (triggerWord.trim()) parts.push(triggerWord.trim());
        if (classifier.trim()) parts.push(classifier.trim());
        parts.push(caption.trim());
        
        const finalCaption = parts.join(', ');
        
        // Add to ZIP
        zip.file(`${baseName}.txt`, finalCaption);
        
        setResults(prev => [...prev, { name: baseName, caption: finalCaption, success: true }]);
        successCount++;
        addLog(`  ✓ Caption generated for ${file.name}`, 'success');
        
      } catch (error) {
        failedCount++;
        addLog(`  ✗ Failed: ${error.message}`, 'error');
        setResults(prev => [...prev, { name: baseName, error: error.message, success: false }]);
      }
      
      setProgress({ current: i + 1, total: files.length });
      
      // Small delay between requests to avoid rate limiting
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setStats({ success: successCount, failed: failedCount, time: elapsed });
    
    addLog(`─────────────────────────────────────────`, 'info');
    addLog(`Processing complete!`, 'success');
    addLog(`  Success: ${successCount} | Failed: ${failedCount} | Time: ${elapsed}s`, 'info');
    
    setIsProcessing(false);
    setIsComplete(true);
  };
  
  const downloadZip = async () => {
    if (!zipRef.current) return;
    
    addLog('Generating ZIP archive...', 'info');
    
    const blob = await zipRef.current.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('ZIP downloaded successfully', 'success');
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  
  const canStart = files.length > 0 && apiKey && !isProcessing;
  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  
  return (
    <div style={styles.container}>
      <div style={styles.noiseOverlay} />
      <div style={styles.gridLines} />
      
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={styles.logoText}>CAPTIONEER</span>
            <span style={styles.version}>v1.0</span>
          </div>
          <button 
            style={styles.settingsBtn}
            onClick={() => setShowSettings(true)}
            onMouseOver={(e) => e.target.style.borderColor = '#ff6b35'}
            onMouseOut={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            ⚙️ Settings
          </button>
        </header>
        
        {/* Main Grid */}
        <div style={styles.mainGrid}>
          {/* Panel 1: System Prompt */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelNumber}>1</div>
              <div>
                <div style={styles.panelTitle}>System Prompt</div>
                <div style={styles.panelSubtitle}>Upload your captioning instruction file</div>
              </div>
            </div>
            
            <input
              type="file"
              ref={promptInputRef}
              accept=".md,.txt"
              onChange={handlePromptUpload}
              style={{ display: 'none' }}
            />
            
            {isPromptLocked ? (
              <div style={{ ...styles.uploadZone, ...styles.uploadZoneLocked }}>
                <div style={styles.lockedBadge}>
                  🔒 LOCKED
                </div>
                <div style={styles.uploadText}>{promptFileName}</div>
                <div style={styles.uploadHint}>
                  {systemPrompt.slice(0, 100)}...
                </div>
                <button 
                  style={styles.unlockBtn}
                  onClick={unlockPrompt}
                  onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  Unlock & Clear
                </button>
              </div>
            ) : systemPrompt ? (
              <div style={styles.uploadZone}>
                <div style={styles.uploadText}>{promptFileName}</div>
                <div style={styles.uploadHint}>{systemPrompt.slice(0, 100)}...</div>
                <button 
                  style={{ ...styles.browseBtn, marginTop: '12px' }}
                  onClick={lockPrompt}
                >
                  🔒 Lock Prompt
                </button>
              </div>
            ) : (
              <div 
                style={styles.uploadZone}
                onClick={() => promptInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setSystemPrompt(event.target.result);
                      setPromptFileName(file.name);
                    };
                    reader.readAsText(file);
                  }
                }}
              >
                <div style={styles.uploadIcon}>📄</div>
                <div style={styles.uploadText}>Drop .md file or click to upload</div>
                <div style={styles.uploadHint}>Custom system prompt for captioning</div>
              </div>
            )}
          </div>
          
          {/* Panel 2: Image Selection */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelNumber}>2</div>
              <div>
                <div style={styles.panelTitle}>Select Images</div>
                <div style={styles.panelSubtitle}>Choose images and videos to caption</div>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              multiple
              webkitdirectory=""
              onChange={handleFilesSelect}
              style={{ display: 'none' }}
            />
            
            <div style={styles.folderSelect}>
              <button 
                style={styles.browseBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Select Folder
              </button>
            </div>
            
            {files.length > 0 && (
              <div style={styles.fileList}>
                {files.slice(0, 10).map((file, idx) => (
                  <div key={idx} style={styles.fileItem}>
                    <div style={styles.fileIcon}>
                      {isVideoFile(file.name) ? '🎬' : '🖼️'}
                    </div>
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileSize}>{formatFileSize(file.size)}</span>
                  </div>
                ))}
                {files.length > 10 && (
                  <div style={{ ...styles.fileItem, color: '#666', justifyContent: 'center' }}>
                    ... and {files.length - 10} more files
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Panel 3 & 4: Trigger & Classifier */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelNumber}>3</div>
              <div>
                <div style={styles.panelTitle}>Trigger Word</div>
                <div style={styles.panelSubtitle}>Optional prefix for all captions</div>
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={triggerWord}
                onChange={(e) => setTriggerWord(e.target.value)}
                placeholder="e.g., sks, ohwx, xyz"
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelNumber}>4</div>
              <div>
                <div style={styles.panelTitle}>Classifier</div>
                <div style={styles.panelSubtitle}>Subject type or category</div>
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={classifier}
                onChange={(e) => setClassifier(e.target.value)}
                placeholder="e.g., woman, man, style, object"
                style={styles.input}
              />
            </div>
          </div>
        </div>
        
        {/* Start Button */}
        <button
          style={{
            ...styles.startBtn,
            ...(canStart ? {} : styles.startBtnDisabled),
          }}
          onClick={processFiles}
          disabled={!canStart}
        >
          {isProcessing ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span>
              Processing...
            </>
          ) : (
            <>
              ▶ Start Captioning
            </>
          )}
        </button>
        
        {/* Progress Panel */}
        {(isProcessing || logs.length > 0) && (
          <div style={styles.progressPanel}>
            <div style={styles.progressHeader}>
              <span style={styles.progressTitle}>
                {isProcessing ? '⚡ Processing...' : isComplete ? '✓ Complete' : 'Ready'}
              </span>
              <span style={styles.progressCount}>
                {progress.current} / {progress.total}
              </span>
            </div>
            
            <div style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill, 
                  width: `${progressPercent}%` 
                }} 
              />
            </div>
            
            {isComplete && (
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{stats.success}</div>
                  <div style={styles.statLabel}>Success</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ ...styles.statValue, color: stats.failed > 0 ? '#ef4444' : '#22c55e' }}>
                    {stats.failed}
                  </div>
                  <div style={styles.statLabel}>Failed</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{stats.time}s</div>
                  <div style={styles.statLabel}>Time</div>
                </div>
              </div>
            )}
            
            <div style={styles.logContainer} ref={logContainerRef}>
              {logs.map((log, idx) => (
                <div key={idx} style={styles.logEntry}>
                  <span style={styles.logTime}>[{log.time}]</span>
                  <span style={{
                    ...styles.logMessage,
                    ...(log.type === 'success' ? styles.logSuccess : {}),
                    ...(log.type === 'error' ? styles.logError : {}),
                  }}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
            
            {isComplete && stats.success > 0 && (
              <button style={styles.downloadBtn} onClick={downloadZip}>
                📦 Download Captions ZIP
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>⚙️ API Settings</span>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>OpenRouter API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="x-ai/grok-4-fast"
                style={styles.input}
              />
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>
              Your API key is stored locally in your browser and is never sent to any server except OpenRouter.
            </div>
            
            <button style={styles.saveBtn} onClick={saveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        input::placeholder {
          color: #444;
        }
        
        input:focus {
          border-color: #ff6b35 !important;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
