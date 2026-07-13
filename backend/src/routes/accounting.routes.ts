import { Router } from 'express';
import { getInvoices, createInvoice, getExpenses, createExpense, approveExpense } from '../controllers/accounting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Invoices routes
router.get('/invoices', authorize('INVOICE_MANAGE'), getInvoices);
router.post('/invoices/create', authorize('INVOICE_MANAGE'), createInvoice);

// Expenses routes
router.get('/expenses', authorize('EXPENSE_MANAGE'), getExpenses);
router.post('/expenses/create', authorize('EXPENSE_MANAGE'), createExpense);
router.put('/expenses/:id/approve', authorize('ALL_ACCESS'), approveExpense);

export default router;
