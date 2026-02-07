import type { RouteObject } from 'react-router-dom';
import FinanceHome from '../modules/home/views';
import FinanceInventoryResult from '../modules/inventory/views/result';

export const getFinanceRoutes = (): RouteObject[] => {
  return [
    {
      path: '/',
      element: <FinanceHome />,
    },
    {
      path: '/inventory',
      children: [
        {
          path: 'result',
          element: <FinanceInventoryResult />,
        },
      ],
    },
  ];
};

export const financeRoutes = getFinanceRoutes();
