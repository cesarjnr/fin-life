import { Route, Routes } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';

import { Sidebar } from '../Sidebar';
import { UserExpenseCategories } from '../../pages/UserExpenseCategories';

export const AuthenticatedRoutes = () => (
  <Flex h="100%">
    <Sidebar />
    <Routes>
      <Route path="user-expense-categories" element={<UserExpenseCategories />} />
    </Routes>
  </Flex>
);