/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Loader2, AlertCircle, Inbox, ArrowLeft } from "lucide-react";
import NotificationService, { type Notification } from "../../services/notificationService";
import { useAuth } from "../../contexts/authContext";
import { MessageBox } from "../../components/ui/messageBox";

export function NotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  async function loadNotifications() {
    try {
      const data = await NotificationService.getAllByUser(user!.id);
      setNotifications(data);
    } catch (err) {
      setError("Não foi possível carregar suas notificações: " + (err instanceof Error ? err.message : "Erro desconhecido"));
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);


  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );

      window.dispatchEvent(new Event('notification-read'));

    } catch (err) {
      setError("Não foi possível marcar a notificação como lida: " + (err instanceof Error ? err.message : "Erro desconhecido"));
      setIsAlertOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-24 sm:py-8">
      <div className="w-full max-w-xl bg-gray-50 min-h-screen sm:min-h-0 sm:border sm:border-gray-200 sm:shadow-sm sm:rounded-3xl overflow-hidden relative flex flex-col">
        
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Notificações</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Sincronizando avisos...</p>
            </div>
          ) : error ? (
            <div className="p-4 m-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 px-8">
              <Inbox className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-lg font-semibold text-gray-900">Tudo limpo por aqui!</h2>
              <p className="text-sm mt-2">Você não possui notificações no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 transition-colors flex gap-4 ${!notif.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell size={20} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="pt-3 flex gap-3">
                      <button 
                        onClick={() => navigate(`/occurrence/${notif.occurrenceId}`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        Ver ocorrência
                      </button>

                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs font-medium text-gray-400 hover:text-green-600 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check size={14} />
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <div className="mt-2 w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MessageBox
              isOpen={isAlertOpen}
              onClose={() => setIsAlertOpen(false)}
              title="Erro"
              message={error}
              type="danger"
              onConfirm={() => {
                setIsAlertOpen(false);
              }}
            />
    </div>
  );
}