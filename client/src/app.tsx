import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Welcome } from '@lark-apaas/client-toolkit/components/Welcome';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import TasksPage from './pages/Tasks/Tasks';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TasksPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
