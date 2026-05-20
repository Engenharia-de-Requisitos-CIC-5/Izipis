'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Trash2, 
  User as UserIcon, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Users as UsersIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getUsers, createUser, deleteUser, getStoredUser } from '@/services/auth';
import { User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const role: UserRole = 'VENDOR';
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
    setCurrentUser(getStoredUser());
    // Polling: atualiza lista de usuários a cada 10 segundos
    const interval = setInterval(() => {
      loadUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Verifica e-mail duplicado
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (emailExists) {
        setMessage({ type: 'error', text: 'Este e-mail já está cadastrado no sistema.' });
        setIsSubmitting(false);
        return;
      }

      await createUser(name.trim(), email.toLowerCase().trim(), role);
      setName('');
      setEmail('');
      setMessage({ type: 'success', text: 'Novo usuário registrado com sucesso!' });
      await loadUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao registrar o usuário.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      setMessage({ type: 'error', text: 'Você não pode excluir o seu próprio usuário logado.' });
      return;
    }

    if (confirm('Deseja realmente remover este usuário do sistema?')) {
      try {
        const success = await deleteUser(userId);
        if (success) {
          setMessage({ type: 'success', text: 'Usuário removido com sucesso.' });
          await loadUsers();
        } else {
          setMessage({ type: 'error', text: 'Erro ao remover o usuário.' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center gap-3">
          <UsersIcon className="w-9 h-9 text-secondary" />
          Controle de Usuários e PDV
        </h1>
        <p className="text-foreground/60 font-medium">Cadastre novos operadores de caixa (PDV) ou administradores e gerencie acessos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel Esquerdo: Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <Card className="border-primary/10 bg-white shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-primary/5 bg-[#F8FAFC]">
              <h2 className="font-bold text-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-secondary" />
                Cadastrar Operador
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleCreateUser} className="space-y-5">
                
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-wider block">Nome do Funcionário</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input 
                      type="text" 
                      placeholder="Ex: João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-primary/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                    />
                  </div>
                </div>

                {/* E-mail (Login) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-wider block">E-mail (Login)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input 
                      type="email" 
                      placeholder="Ex: joao@izipis.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-primary/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                    />
                  </div>
                </div>



                {/* Notificações / Feedbacks */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "p-4 rounded-xl text-xs font-bold flex items-start gap-3 border",
                        message.type === 'success' 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-danger/10 border-danger/20 text-danger"
                      )}
                    >
                      {message.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <span>{message.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão de Submissão */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl h-12 text-xs font-black uppercase tracking-widest bg-secondary hover:bg-secondary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-secondary/25"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Registrando...' : 'Registrar Usuário'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Painel Direito: Lista de Usuários */}
        <div className="lg:col-span-2">
          <Card className="border-primary/10 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-primary/5 bg-[#F8FAFC]">
              <h2 className="font-bold text-primary flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-secondary" />
                Usuários Cadastrados
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-primary/5">
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Usuário</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Perfil / Acesso</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Status</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-primary/20">
                        <div className="w-8 h-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin mx-auto mb-2" />
                        Carregando banco de funcionários...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-primary/40 font-medium">
                        Nenhum funcionário cadastrado.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const isSelf = currentUser?.id === user.id;
                      return (
                        <tr key={user.id} className="hover:bg-primary/5 transition-all">
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-primary flex items-center gap-1.5">
                                  {user.name}
                                  {isSelf && (
                                    <Badge className="bg-secondary/10 text-secondary border-none font-bold text-[9px] px-1.5 py-0.5">Você</Badge>
                                  )}
                                </p>
                                <p className="text-xs text-primary/40 font-medium mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            {user.role === 'ADMIN' ? (
                              <Badge className="bg-primary/5 text-primary border border-primary/10 font-bold uppercase tracking-wider text-[9px]">
                                Administrador
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider text-[9px]">
                                Operador PDV
                              </Badge>
                            )}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-xs font-bold text-emerald-600">Ativo</span>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <button
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(user.id)}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                isSelf 
                                  ? "border-primary/5 text-primary/10 cursor-not-allowed" 
                                  : "border-danger/10 text-danger hover:bg-danger/10"
                              )}
                              title={isSelf ? "Não é possível excluir você mesmo" : "Excluir Usuário"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
