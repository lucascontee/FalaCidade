import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import CategoryService from '../../services/categoryService'; // Ajuste o caminho

export function CategoryCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim()) {
      return setError('Preencha todos os campos.');
    }

    setIsSubmitting(true);
    try {
      await CategoryService.create({ name, description });
      navigate('/feed'); 
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar a categoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8">
      <div className="w-full max-w-xl bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden flex flex-col">
        
        <header className="border-b border-gray-100 px-6 py-5 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nova Categoria</h1>
        </header>

        <div className="p-6">
          <p className="text-gray-500 mb-8">
            Cadastre um novo tipo de problema para organizar os relatórios dos cidadãos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-gray-700 block">
                Nome da Categoria
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Iluminação Pública"
                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-700 block">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Problemas com postes apagados ou fios caídos..."
                className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all min-h-[120px] resize-y"
                maxLength={200}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Categoria
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}