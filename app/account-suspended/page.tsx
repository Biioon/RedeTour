'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, Mail } from 'lucide-react';

export default function AccountSuspendedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para home após 10 segundos
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conta Suspensa
          </h1>
          <p className="text-gray-600">
            Sua conta foi temporariamente suspensa. Entre em contato com o suporte para mais informações.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Possíveis razões:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Violação dos termos de serviço</li>
              <li>• Atividades suspeitas detectadas</li>
              <li>• Pagamento pendente</li>
              <li>• Verificação de identidade necessária</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar para Home
            </Link>
            
            <a
              href="mailto:support@redetour.com"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contatar Suporte
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Você será redirecionado para a página inicial em 10 segundos...
          </p>
        </div>
      </div>
    </div>
  );
}