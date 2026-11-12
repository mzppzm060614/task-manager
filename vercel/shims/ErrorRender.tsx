/* Vercel 静态部署用的 ErrorRender 垫片：替代平台的错误展示组件。 */
import React from 'react';

interface ErrorRenderProps {
  error?: Error;
  resetErrorBoundary?: (...args: unknown[]) => void;
  [key: string]: unknown;
}

export const ErrorRender: React.FC<ErrorRenderProps> = ({ error, resetErrorBoundary }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
    <h1 className="text-xl font-semibold">页面出错了</h1>
    <pre className="max-w-full overflow-auto rounded bg-muted p-4 text-sm">
      {error?.message ?? '未知错误'}
    </pre>
    {resetErrorBoundary ? (
      <button className="rounded border px-4 py-2" onClick={() => resetErrorBoundary()}>
        重试
      </button>
    ) : null}
  </div>
);

export default ErrorRender;
