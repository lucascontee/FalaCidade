import { NavLink } from "react-router-dom";
import { LayoutGrid, ClipboardList, PlusCircle, LogOut } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out w-16 hover:w-64 group z-50 flex flex-col">
      
      {/* Cabeçalho / Logo do Menu */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 w-full whitespace-nowrap">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            FalaCidade
          </span>
        </div>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
        <SidebarItem 
          to="/feed" 
          icon={<LayoutGrid size={24} />} 
          label="Feed" 
        />
        <SidebarItem 
          to="/myOccurrences" 
          icon={<ClipboardList size={24} />} 
          label="Minhas ocorrências" 
        />
        <SidebarItem 
          to="/occurrence" 
          icon={<PlusCircle size={24} />} 
          label="Criar ocorrência" 
        />
      </nav>

      {/* Rodapé com botão de Sair */}
      <div className="p-2 border-t border-gray-100">
        <SidebarItem 
          to="/" 
          icon={<LogOut size={24} className="text-red-500" />} 
          label="Sair" 
          isLogout
        />
      </div>
    </aside>
  );
}

// Subcomponente para facilitar a criação dos botões
interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isLogout?: boolean;
}

function SidebarItem({ to, icon, label, isLogout }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors overflow-hidden ${
          isActive && !isLogout
            ? "bg-blue-50 text-blue-600" // Cor quando a página está ativa
            : isLogout
            ? "text-gray-600 hover:bg-red-50 hover:text-red-600" // Cor específica para o logout
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Cor padrão
        }`
      }
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {label}
      </span>
    </NavLink>
  );
}