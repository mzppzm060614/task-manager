/*
 * Vercel 静态部署用的 AppContainer 垫片。
 * 平台版组件负责主题上下文和 React Query 的 QueryClientProvider，这里保留同样的职责：
 * 提供 QueryClientProvider + 基础容器，保证业务页面的 useQuery/useMutation 正常工作。
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AppContainerProps {
  children?: React.ReactNode;
  defaultTheme?: string;
  [key: string]: unknown;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <div className="app-container min-h-screen">{children}</div>
  </QueryClientProvider>
);

export default AppContainer;
