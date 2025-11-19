'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Obter mensagem de erro da URL
    const errorMessage = searchParams.get('message');
    if (errorMessage) {
      setMessage(decodeURIComponent(errorMessage));
    }

    // Redirecionar para dashboard após 5 segundos
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Não Autorizado
          </h1>
          <p className="text-gray-600">
            {message || 'Você não tem permissão para acessar esta página.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">O que você pode fazer:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• Verifique se está logado com a conta correta</li>
              <li>• Contate o administrador se precisar de acesso</li>
              <li>• Volte para a página anterior</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Você será redirecionado para o dashboard em 5 segundos...
          </p>
        </div>
      </div>
    </div>
  );
}