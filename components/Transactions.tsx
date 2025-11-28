import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, TransactionAttachment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { categorizeTransaction, parseTransactionFromText, parseTransactionFromAudio, parseTransactionFromReceipt } from '../services/aiProviderService';
import { Plus, Paperclip, Loader2, Trash2, Edit2, ArrowDownCircle, ArrowUpCircle, Search, Sparkles, Mic, Square, RefreshCw, CalendarClock, CreditCard, X, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, UploadCloud, File as FileIcon, Download, Camera, Check, RotateCcw } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction?: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  currentUserId: string;
  currencyFormatter: (value: number) => string;
  onExport: (type: 'PDF' | 'CSV') => void;
}

const ITEMS_PER_PAGE = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const Transactions: React.FC<TransactionsProps> = ({ 
  transactions, 
  addTransaction, 
  updateTransaction,
  deleteTransaction,
  currentUserId,
  currencyFormatter,
  onExport
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'history' | 'subscriptions'>('history');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [smartInput, setSmartInput] = useState('');
  const [isProcessingSmart, setIsProcessingSmart] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.EXPENSE,
    category: '',
    date: new Date().toISOString().split('T')[0],
    attachments: [] as TransactionAttachment[],
    isRecurring: false,
    frequency: 'monthly' as 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'semiannual' | 'yearly'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const inputClass = "w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all";

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleEdit = (transaction: Transaction) => {
    if (transaction.userId !== currentUserId) {
      alert(t("transactions.cannot_edit_others"));
      return;
    }

    setEditingId(transaction.id);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      attachments: transaction.attachments || [],
      isRecurring: transaction.isRecurring || false,
      frequency: transaction.frequency || 'monthly'
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      description: '',
      amount: '',
      type: TransactionType.EXPENSE,
      category: '',
      date: new Date().toISOString().split('T')[0],
      attachments: [],
      isRecurring: false,
      frequency: 'monthly'
    });
    setShowForm(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert(t("transactions.microphone_error"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessingSmart(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(',')[1];
        try {
          const result = await parseTransactionFromAudio(base64Content);
          setFormData(prev => ({
            ...prev,
            description: result.description || prev.description,
            amount: result.amount?.toString() || prev.amount,
            type: (result.type as TransactionType) || prev.type,
            category: result.category || prev.category,
            date: result.date || prev.date,
            isRecurring: result.isRecurring || prev.isRecurring,
            frequency: result.frequency || prev.frequency
          }));
          setShowForm(true);
        } catch (error) {
          alert(t("transactions.could_not_understand_audio"));
        } finally {
          setIsProcessingSmart(false);
        }
      };
    } catch (error) {
      setIsProcessingSmart(false);
    }
  };

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;

    setIsProcessingSmart(true);
    try {
      const result = await parseTransactionFromText(smartInput);
      setFormData(prev => ({
        ...prev,
        description: result.description || prev.description,
        amount: result.amount?.toString() || prev.amount,
        type: (result.type as TransactionType) || prev.type,
        category: result.category || prev.category,
        date: result.date || prev.date,
        isRecurring: result.isRecurring || prev.isRecurring,
        frequency: result.frequency || prev.frequency
      }));
      setSmartInput('');
      setShowForm(true); 
    } catch (error) {
      alert(t("transactions.could_not_understand_text"));
    } finally {
      setIsProcessingSmart(false);
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const desc = e.target.value;
    setFormData(prev => ({ ...prev, description: desc }));

    if (desc.length > 3 && !editingId) {
      setIsAnalyzing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600)); 
        const category = await categorizeTransaction(desc, transactions);
        setFormData(prev => ({ ...prev, category }));
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    setCapturedImage(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer rear camera on mobile
        } 
      });
      setCameraStream(stream);
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (e) {
      console.error(e);
      alert(t("transactions.camera_error"));
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality JPEG
        setCapturedImage(dataUrl);
      }
    }
  };

  const saveCapturedPhoto = () => {
    if (capturedImage) {
      const newAttachment: TransactionAttachment = {
        id: `${Date.now()}-cam`,
        name: `Foto_Recibo_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
        size: Math.round((capturedImage.length * 3) / 4), // Approximate size
        type: 'image/jpeg',
        content: capturedImage
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      stopCamera();
    }
  };

  const handleReceiptOCR = async () => {
    if (capturedImage) {
      setIsProcessingSmart(true);
      try {
        const result = await parseTransactionFromReceipt(capturedImage);
        setFormData(prev => ({
          ...prev,
          description: result.description || prev.description,
          amount: result.amount?.toString() || prev.amount,
          type: (result.type as TransactionType) || prev.type,
          category: result.category || prev.category,
          date: result.date || prev.date
        }));
        stopCamera();
        setShowForm(true);
      } catch (error) {
        alert(t("transactions.could_not_process_receipt"));
      } finally {
        setIsProcessingSmart(false);
      }
    }
  };

  // Removed explicit File type to avoid conflict with imported icon
  const convertFileToBase64 = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Use inference instead of explicit File[] type
      const files = Array.from(e.target.files) as File[];
      const newAttachments: TransactionAttachment[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          alert(t("transactions.file_size_limit") + ` ${file.name}.`);
          continue;
        }

        try {
          const base64Content = await convertFileToBase64(file);
          newAttachments.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: base64Content
          });
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          alert(t("transactions.error_loading_file") + ` ${file.name}`);
        }
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const downloadAttachment = (attachment: TransactionAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.content;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      userId: currentUserId,
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category || t("transactions.general"),
      date: formData.date,
      attachments: formData.attachments,
      isRecurring: formData.isRecurring,
      frequency: formData.isRecurring ? formData.frequency : undefined
    };

    if (editingId && updateTransaction) {
      updateTransaction({ ...transactionData, id: editingId });
    } else {
      addTransaction(transactionData);
    }
    
    setShowForm(false);
    setEditingId(null);
    setFormData({ description: '', amount: '', type: TransactionType.EXPENSE, category: '', date: new Date().toISOString().split('T')[0], attachments: [], isRecurring: false, frequency: 'monthly' });
  };

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(t => 
      (t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === 'subscriptions' ? t.isRecurring : !t.isRecurring)
    );
    return filtered;
  }, [transactions, searchTerm, activeTab]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalSubscriptions = transactions
    .filter(t => t.isRecurring && t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full max-w-full overflow-hidden">
      {/* Smart Input Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden" data-tour="smart-input">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
         <h3 className="flex items-center text-base md:text-lg font-bold mb-3 relative z-10 flex-wrap">
           <Sparkles className="mr-2 text-yellow-300" /> {t("transactions.smart_input")}
         </h3>
         <form onSubmit={handleSmartSubmit} className="relative flex flex-col sm:flex-row items-center gap-3 z-10">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                value={smartInput}
                onChange={e => setSmartInput(e.target.value)}
                placeholder="Ex: Paguei 15000 na internet..."
                className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 outline-none"
                disabled={isProcessingSmart || isRecording}
              />
              <button 
                type="submit" 
                disabled={isProcessingSmart || isRecording}
                className="absolute right-2 top-2 bottom-2 bg-white text-indigo-600 px-4 rounded-xl font-bold hover:bg-indigo-50 transition flex items-center justify-center disabled:opacity-70 shadow-sm active:scale-95"
              >
                {isProcessingSmart ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpCircle size={24} />}
              </button>
            </div>
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessingSmart}
              className={`p-4 rounded-2xl font-bold transition flex items-center justify-center shadow-lg border border-white/20 w-full sm:w-auto active:scale-95
                ${isRecording 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50' 
                  : 'bg-white/10 hover:bg-white/20 text-white'}
              `}
              title={isRecording ? "Parar Gravação" : "Gravar Áudio"}
            >
              {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
            </button>
         </form>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white truncate">{t("transactions.title")}</h2>
            <p className="text-slate-500 text-sm hidden md:block">{t("transactions.subtitle")}</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto" data-tour="transactions-tabs">
             <button 
               onClick={() => setActiveTab('history')}
               className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               {t("common.history")}
             </button>
             <button 
               onClick={() => setActiveTab('subscriptions')}
               className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'subscriptions' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               <RefreshCw size={14} className="mr-2"/> {t("transactions.subscriptions")}
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => onExport('PDF')}
              className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition font-bold text-sm border border-rose-100 dark:border-rose-800 active:scale-95"
              title="Exportar PDF"
            >
              <FileText size={18} className="mr-2" /> PDF
            </button>
            <button 
              onClick={() => onExport('CSV')}
              className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition font-bold text-sm border border-emerald-100 dark:border-emerald-800 active:scale-95"
              title="Exportar Excel (CSV)"
            >
              <FileSpreadsheet size={18} className="mr-2" /> Excel
            </button>
          </div>

          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition text-slate-800 dark:text-white"
            />
          </div>
          <button 
            data-tour="btn-new-transaction"
            onClick={handleAddNew}
            className="flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/20 font-bold whitespace-nowrap active:scale-95"
          >
            <Plus size={20} className="mr-2" />
            Nova
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 dark:border-slate-700 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">
                {editingId ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 active:scale-95 transition-transform">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})}
                  className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all active:scale-95 ${formData.type === TransactionType.EXPENSE ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                >
                  <p className="font-bold">Despesa</p>
                </div>
                <div 
                  onClick={() => setFormData({...formData, type: TransactionType.INCOME})}
                  className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all active:scale-95 ${formData.type === TransactionType.INCOME ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                >
                  <p className="font-bold">Receita</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Valor</label>
                <input 
                  type="number" 
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className={`${inputClass} text-lg font-bold tabular-nums`}
                />
                {formData.amount && (
                  <p className="text-right text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">
                    {currencyFormatter(Number(formData.amount))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Ex: Uber..."
                    className={inputClass}
                  />
                  {isAnalyzing && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="animate-spin text-primary-500" size={20} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder={t("transactions.general")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comprovativos e Recibos</label>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                   <div className="mb-3 flex flex-col sm:flex-row gap-3">
                      {/* Upload de Arquivo Tradicional */}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          multiple 
                          id="file-upload" 
                          className="hidden" 
                          onChange={handleFileChange} 
                          accept="image/*,application/pdf"
                        />
                        <label 
                          htmlFor="file-upload" 
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition group h-full min-h-[100px] active:scale-95"
                        >
                           <div className="text-center">
                              <UploadCloud size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-primary-500" />
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Carregar Arquivo</p>
                              <p className="text-xs text-slate-400 mt-1">PDF/IMG (Max 20MB)</p>
                           </div>
                        </label>
                      </div>

                      {/* Botão de Câmera */}
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition group flex flex-col items-center justify-center min-h-[100px] active:scale-95"
                      >
                         <Camera size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-primary-500" />
                         <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Usar Câmera</p>
                         <p className="text-xs text-slate-400 mt-1">Tirar foto do recibo</p>
                      </button>
                   </div>

                   {formData.attachments.length > 0 && (
                     <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {formData.attachments.map((file) => (
                           <div key={file.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                 <FileIcon size={16} className="text-slate-400 shrink-0" />
                                 <div className="min-w-0">
                                   <p className="text-sm font-medium text-slate-700 dark:text-white truncate" title={file.name}>{file.name}</p>
                                   <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                                 </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeAttachment(file.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition active:scale-90"
                                title="Remover"
                              >
                                <X size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isRecurring} 
                      onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-white flex items-center">
                      <RefreshCw size={14} className="mr-1"/> Recorrente?
                    </span>
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="animate-fade-in mt-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Frequência</label>
                    <select 
                      value={formData.frequency} 
                      onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                      className={inputClass}
                    >
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quinzenal</option>
                      <option value="monthly">Mensal</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="semiannual">Semestral</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition active:scale-95"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition active:scale-95"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in">
           <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
             ></video>
             
             {capturedImage && (
               <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
             )}

             <canvas ref={canvasRef} className="hidden"></canvas>

             <button 
                onClick={stopCamera} 
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10 active:scale-95"
              >
                <X size={32} />
              </button>
           </div>

           <div className="bg-black p-6 flex items-center justify-center gap-8 pb-10">
              {!capturedImage ? (
                <button 
                  onClick={takePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition"></div>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setCapturedImage(null)}
                    className="flex flex-col items-center text-white gap-1 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                       <RotateCcw size={24} />
                    </div>
                    <span className="text-xs">Repetir</span>
                  </button>

                  <button 
                    onClick={saveCapturedPhoto}
                    className="flex flex-col items-center text-white gap-1 active:scale-95 transition-transform"
                  >
                     <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                        <Check size={32} />
                     </div>
                     <span className="text-xs font-bold">Guardar</span>
                  </button>

                  <button 
                    onClick={handleReceiptOCR}
                    disabled={isProcessingSmart}
                    className="flex flex-col items-center text-white gap-1 active:scale-95 transition-transform disabled:opacity-50"
                  >
                     <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        {isProcessingSmart ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
                     </div>
                     <span className="text-xs font-bold">OCR Recibo</span>
                  </button>
                </>
              )}
           </div>
        </div>
      )}

      {/* VIEW: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
             <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h3 className="text-lg font-bold mb-1 opacity-90">Custo Mensal Recorrente</h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight break-words min-w-0">{currencyFormatter(totalSubscriptions)}</p>
               </div>
               <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm self-end sm:self-auto">
                 <CalendarClock size={32} />
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTransactions.map(t => (
                <div key={t.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-between group hover:-translate-y-1 transition duration-300 min-w-0">
                   <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${t.type === 'RECEITA' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                        {t.type === 'RECEITA' ? <ArrowUpCircle size={24} /> : <CreditCard size={24} />}
                     </div>
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                       {t.frequency === 'weekly' ? 'Semanal' : t.frequency === 'biweekly' ? 'Quinzenal' : t.frequency === 'monthly' ? 'Mensal' : t.frequency === 'quarterly' ? 'Trimestral' : t.frequency === 'semiannual' ? 'Semestral' : 'Anual'}
                     </span>
                   </div>
                   
                   <div className="min-w-0">
                     <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-white mb-1 truncate line-clamp-2">{t.description}</h4>
                     <p className="text-slate-400 text-xs sm:text-sm mb-4 font-medium truncate">{t.category}</p>
                     <p className={`text-sm sm:text-lg md:text-xl font-bold break-words min-w-0 ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-slate-700 dark:text-white'}`}>
                       {currencyFormatter(t.amount)}
                     </p>
                   </div>

                   <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(t)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg active:scale-95 transition-transform"><Edit2 size={18}/></button>
                      <button onClick={() => deleteTransaction(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg active:scale-95 transition-transform"><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* VIEW: History Table */}
      {activeTab === 'history' && (
        <>
          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                    <th className="p-4 md:p-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Transação</th>
                    <th className="p-4 md:p-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th className="p-4 md:p-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="p-4 md:p-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Valor</th>
                    <th className="p-4 md:p-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {paginatedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="p-4 md:p-6">
                        <div className="flex items-center">
                          <div className={`p-2.5 rounded-full mr-4 shrink-0 ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                            {t.type === TransactionType.INCOME ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white text-base truncate max-w-[120px] sm:max-w-xs" title={t.description}>{t.description}</p>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                               {(t.attachments && t.attachments.length > 0) ? (
                                 <div className="flex gap-1">
                                   {t.attachments.slice(0, 1).map((att) => (
                                     <button 
                                       key={att.id}
                                       onClick={() => downloadAttachment(att)}
                                       className="flex items-center text-xs text-primary-500 hover:text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md transition active:scale-95"
                                       title={`Baixar ${att.name}`}
                                     >
                                       <FileIcon size={10} className="mr-1" /> {t.attachments && t.attachments.length > 1 ? `${t.attachments.length} Anexos` : 'Anexo'}
                                     </button>
                                   ))}
                                 </div>
                               ) : t.attachmentName ? (
                                 <span className="flex items-center text-xs text-slate-400 font-medium">
                                   <Paperclip size={10} className="mr-1" /> Anexo (Antigo)
                                 </span>
                               ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-6">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-sm text-slate-500 font-medium whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className={`p-4 md:p-6 text-right font-bold text-base whitespace-nowrap tabular-nums ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} {currencyFormatter(t.amount)}
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                           {t.userId === currentUserId && (
                            <>
                              <button 
                                onClick={() => handleEdit(t)}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition active:scale-90"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => { if(confirm('Excluir?')) deleteTransaction(t.id); }}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition active:scale-90"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View (Simplified List) */}
          <div className="md:hidden space-y-3">
            {paginatedTransactions.map(t => (
              <div key={t.id} onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-transform cursor-pointer">
                 {/* Header: Transação | Valor */}
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 overflow-hidden">
                       {/* Icon */}
                       <div className={`p-2 rounded-full shrink-0 ${t.type === 'RECEITA' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                          {t.type === 'RECEITA' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                       </div>
                       <span className="font-bold text-slate-800 dark:text-white truncate text-sm">{t.description}</span>
                    </div>
                    <span className={`font-bold whitespace-nowrap text-sm ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-rose-500'}`}>
                       {t.type === 'RECEITA' ? '+' : '-'} {currencyFormatter(t.amount)}
                    </span>
                 </div>

                 {/* Expanded Details */}
                 {expandedId === t.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-fade-in space-y-3">
                       {/* Details Grid */}
                       <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Data</p>
                             <p className="text-slate-700 dark:text-slate-200 font-medium">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Categoria</p>
                             <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">{t.category}</span>
                          </div>
                       </div>

                       {/* Attachments */}
                       {(t.attachments && t.attachments.length > 0) && (
                         <div className="flex flex-wrap gap-2">
                           {t.attachments.map((att) => (
                             <button 
                               key={att.id}
                               onClick={(e) => { e.stopPropagation(); downloadAttachment(att); }}
                               className="flex items-center text-xs text-primary-500 hover:text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg transition border border-primary-100 dark:border-primary-900"
                             >
                               <FileIcon size={12} className="mr-1" /> {att.name}
                             </button>
                           ))}
                         </div>
                       )}

                       {/* Actions */}
                       {t.userId === currentUserId && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 mt-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleEdit(t); }} 
                               className="px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center"
                             >
                               <Edit2 size={12} className="mr-1"/> Editar
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); if(confirm('Excluir?')) deleteTransaction(t.id); }} 
                               className="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center"
                             >
                               <Trash2 size={12} className="mr-1"/> Excluir
                             </button>
                          </div>
                       )}
                    </div>
                 )}
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {filteredTransactions.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 mt-4 md:mt-0 rounded-b-3xl md:rounded-b-none rounded-t-3xl md:rounded-t-none">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={totalPages === 0 || currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;