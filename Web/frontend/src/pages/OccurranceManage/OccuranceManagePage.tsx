/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Search, MapPin, Loader2, AlertCircle, Send, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ImageWithFallback } from "../../components/ui/imageWithFallback";
import OccurrenceService, { type Occurrence, type OccurrenceHistory, OccurrenceStatus } from "../../services/ocurrenceService";
import { useAuth } from "../../context/authContext";
import axios from "axios";

function getStatusConfig(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: return { color: "bg-amber-100 text-amber-800", label: "Em Análise", icon: Clock };
    case OccurrenceStatus.InProgress: return { color: "bg-blue-100 text-blue-800", label: "Em Andamento", icon: AlertTriangle };
    case OccurrenceStatus.Resolved: return { color: "bg-green-100 text-green-800", label: "Resolvido", icon: CheckCircle2 };
    case OccurrenceStatus.Rejected: return { color: "bg-red-100 text-red-800", label: "Reprovado", icon: XCircle };
    default: return { color: "bg-gray-100 text-gray-800", label: "Desconhecido", icon: AlertCircle };
  }
}

export function OccurrenceManageScreen() {
  const { user } = useAuth();
  
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  
  const [histories, setHistories] = useState<OccurrenceHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState<OccurrenceStatus | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOccurrences();
  }, []);

  async function loadOccurrences() {
    try {
      const data = await OccurrenceService.getAll();
      setOccurrences(data);
    } catch (err) {
      setError("Não foi possível carregar as ocorrências.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelect = async (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence);
    setNewStatus(occurrence.status);
    setNewMessage("");
    
    setIsLoadingHistory(true);
    try {
      const historyData = await OccurrenceService.getHistory(occurrence.id);
      setHistories(historyData);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setHistories([]); 
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOccurrence || !user || newStatus === "") return;

    setIsSubmitting(true);
    try {
      await OccurrenceService.updateStatus(selectedOccurrence.id, {
        newStatus: Number(newStatus) as OccurrenceStatus,
        message: newMessage,
        userId: user.id
      });

      await loadOccurrences(); 
      setSelectedOccurrence(prev => prev ? { ...prev, status: Number(newStatus) as OccurrenceStatus } : null);
      
      const updatedHistory = await OccurrenceService.getHistory(selectedOccurrence.id);
      setHistories(updatedHistory);
      
      setNewMessage("");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || "Erro ao atualizar ocorrência.");
      } else {
        alert("Erro inesperado ao conectar com o servidor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = occurrences.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Gestão de Ocorrências</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar ocorrência..." 
              className="pl-9 h-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-8 text-gray-500 text-sm">Nenhuma ocorrência encontrada.</div>
          ) : (
            filtered.map(occurrence => {
              const statusCfg = getStatusConfig(occurrence.status);
              const isSelected = selectedOccurrence?.id === occurrence.id;
              
              return (
                <div 
                  key={occurrence.id}
                  onClick={() => handleSelect(occurrence)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500">{occurrence.category?.name || "Sem Categoria"}</span>
                    <span className="text-[10px] text-gray-400">{new Date(occurrence.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-2">{occurrence.title}</h3>
                  <Badge className={`text-[10px] px-1.5 py-0 ${statusCfg.color}`}>{statusCfg.label}</Badge>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col h-full bg-gray-50 overflow-hidden">
        {selectedOccurrence ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
            
            <div className="flex-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOccurrence.title}</h2>
                  <Badge className={getStatusConfig(selectedOccurrence.status).color}>
                    {getStatusConfig(selectedOccurrence.status).label}
                  </Badge>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap mb-6">{selectedOccurrence.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedOccurrence.street}{selectedOccurrence.neighborhood ? `, ${selectedOccurrence.neighborhood}` : ''} - {selectedOccurrence.city}</span>
                </div>

                <div className="flex justify-center w-full">
                  <div className="aspect-[4/5] w-full max-w-sm rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                    <ImageWithFallback 
                      src={selectedOccurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto"}
                      alt="Foto da ocorrência"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="w-full xl:w-[400px] flex flex-col gap-4">
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 sticky top-0 bg-white z-20 pb-2 border-b border-gray-50">Histórico de Ações</h3>
                
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : histories.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-8">Nenhum histórico registrado ainda.</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {histories.map((history, idx) => {
                      const StatusIcon = getStatusConfig(history.newStatus).icon;
                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm ${getStatusConfig(history.newStatus).color.split(' ')[0]}`}>
                            <StatusIcon className="w-4 h-4 text-current" />
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1 shadow-sm">
                            <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-1 gap-1">
                              <span className="text-xs font-bold text-gray-900">{history.responsibleUser?.name || `Usuário #${history.responsibleUserId}`}</span>
                              <span className="text-[10px] text-gray-500">{new Date(history.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{history.notes}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdate} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <h3 className="font-bold text-gray-900 mb-3">Atualizar Ocorrência</h3>
                
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(Number(e.target.value) as OccurrenceStatus)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    required
                  >
                    <option value={OccurrenceStatus.UnderReview}>Em Análise</option>
                    <option value={OccurrenceStatus.InProgress}>Aprovado (Em Andamento)</option>
                    <option value={OccurrenceStatus.Resolved}>Resolvido</option>
                    <option value={OccurrenceStatus.Rejected}>Reprovado</option>
                  </select>

                  <textarea
                    placeholder="Adicione uma mensagem ou justificativa..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white min-h-[100px] resize-none text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    required
                  />

                  <Button type="submit" disabled={isSubmitting || !newMessage} className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">Selecione uma ocorrência para visualizar e gerenciar.</p>
          </div>
        )}
      </div>
    </div>
  );
}