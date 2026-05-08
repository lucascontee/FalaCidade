/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Loader2, User as UserIcon, Calendar
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/ui/imageWithFallback";
import OccurrenceService, { type Occurrence, type OccurrenceHistory, OccurrenceStatus } from "../../services/ocurrenceService";
import UserService from "../../services/userService";

function getStatusConfig(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: return { color: "bg-amber-100 text-amber-800", label: "Em Análise", icon: Clock };
    case OccurrenceStatus.InProgress: return { color: "bg-blue-100 text-blue-800", label: "Em Andamento", icon: AlertTriangle };
    case OccurrenceStatus.Resolved: return { color: "bg-green-100 text-green-800", label: "Resolvido", icon: CheckCircle2 };
    case OccurrenceStatus.Rejected: return { color: "bg-red-100 text-red-800", label: "Reprovado", icon: XCircle };
    default: return { color: "bg-gray-100 text-gray-800", label: "Desconhecido", icon: Clock };
  }
}

export function OccurrenceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [histories, setHistories] = useState<OccurrenceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [citizenName, setCitizenName] = useState("");

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  async function loadData(occurrenceId: number) {
    try {
      const [occurrenceData, historyData] = await Promise.all([
        OccurrenceService.getById(occurrenceId),
        OccurrenceService.getHistory(occurrenceId)
      ]);
      setOccurrence(occurrenceData);
      setHistories(historyData);
      UserService.getUserById(occurrenceData.citizenId || 0).then(user => {
        setCitizenName(user.name);
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="font-medium">Carregando detalhes da ocorrência...</p>
      </div>
    );
  }

  if (!occurrence) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Ocorrência não encontrada</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Voltar</button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(occurrence.status);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-12">
      <div className="w-full max-w-3xl bg-white min-h-screen sm:min-h-0 sm:mt-8 sm:mb-8 sm:rounded-3xl sm:shadow-sm border-x border-gray-100 overflow-hidden">
        
        <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
            <Badge className={`${statusCfg.color} px-3 py-1 text-xs`}>
                {statusCfg.label}
            </Badge>
        </header>

        <div className="p-6 space-y-8">
          
          <section className="space-y-4">
            <div className="flex justify-between align-center items-start mb-1">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                {occurrence.title}
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={14} />
                {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed text-base">
              {occurrence.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <UserIcon size={16} className="text-blue-500" />
              <span>Solicitante: <span className="text-gray-900">{citizenName || "Cidadão"}</span></span>
            </div>
          </section>

          <section className="flex justify-center">
            <div className="aspect-[4/5] w-full max-w-sm rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
              <ImageWithFallback 
                src={occurrence.photoUrl} 
                alt={occurrence.title}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
            <div className="flex items-start gap-2 text-sm text-gray-500 italic">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <span>{occurrence.street}{occurrence.neighborhood ? `, ${occurrence.neighborhood}` : ''} - {occurrence.city}</span>
            </div>

          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Histórico de Atualizações</h3>
            
            {histories.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 italic">
                Aguardando primeira análise da equipe técnica.
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                {histories.map((step, idx) => {
                  const stepCfg = getStatusConfig(step.newStatus);
                  const Icon = stepCfg.icon;

                  return (
                    <div key={idx} className="relative flex items-start gap-6">
                      <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${stepCfg.color.split(' ')[0]}`}>
                        <Icon size={16} className="text-current" />
                      </div>

                      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-900">
                            {step.userName || "Equipe FalaCidade"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(step.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.notes}
                        </p>
                        <div className="mt-3">
                          <Badge className={`${stepCfg.color} text-[9px] px-2 py-0`}>
                            {stepCfg.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}