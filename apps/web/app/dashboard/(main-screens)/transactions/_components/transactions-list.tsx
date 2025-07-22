import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpRight,
  ArrowDownLeft,
  type LucideIcon,
  MoreHorizontal,
  Eye,
  Wallet,
  ShoppingCart,
  CreditCard,
  Coffee,
  Car,
  Home,
  Utensils,
  Plane,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/app/dashboard/_hooks/use-transactions';

interface TransactionsListProps {
  transactions: Transaction[];
  locale?: string;
}

export default function TransactionsList({
  transactions,
  locale = 'en-US',
}: TransactionsListProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (transaction: Transaction): LucideIcon => {
    // Map category to icon
    const categoryToIcon: Record<string, LucideIcon> = {
      food: Utensils,
      shopping: ShoppingCart,
      transport: Car,
      housing: Home,
      entertainment: CreditCard,
      travel: Plane,
      income: Wallet,
      investment: ArrowDownLeft,
      electronics: Smartphone,
      groceries: ShoppingCart,
    };

    return (
      categoryToIcon[transaction.category.toLowerCase()] ||
      (transaction.type === 'income' ? ArrowDownLeft : ArrowUpRight)
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: Record<string, { bg: string; text: string }> = {
      food: {
        bg: 'bg-orange-100 bg-orange-900/30',
        text: 'text-orange-600 text-orange-400',
      },
      shopping: {
        bg: 'bg-blue-100 bg-blue-900/30',
        text: 'text-blue-600 text-blue-400',
      },
      transport: {
        bg: 'bg-purple-100 bg-purple-900/30',
        text: 'text-purple-600 text-purple-400',
      },
      housing: {
        bg: 'bg-teal-100 bg-teal-900/30',
        text: 'text-teal-600 text-teal-400',
      },
      entertainment: {
        bg: 'bg-pink-100 bg-pink-900/30',
        text: 'text-pink-600 text-pink-400',
      },
      travel: {
        bg: 'bg-indigo-100 bg-indigo-900/30',
        text: 'text-indigo-600 text-indigo-400',
      },
      income: {
        bg: 'bg-emerald-100 bg-emerald-900/30',
        text: 'text-emerald-600 text-emerald-400',
      },
      investment: {
        bg: 'bg-amber-100 bg-amber-900/30',
        text: 'text-amber-600 text-amber-400',
      },
      electronics: {
        bg: 'bg-sky-100 bg-sky-900/30',
        text: 'text-sky-600 text-sky-400',
      },
      groceries: {
        bg: 'bg-lime-100 bg-lime-900/30',
        text: 'text-lime-600 text-lime-400',
      },
    };

    const config = categoryConfig[category] || {
      bg: 'bg-gray-100 bg-gray-800',
      text: 'text-gray-600 text-gray-400',
    };

    return (
      <Badge
        variant="outline"
        className={cn('font-normal', config.bg, config.text)}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      completed: {
        bg: 'bg-emerald-100 bg-emerald-900/30',
        text: 'text-emerald-600 text-emerald-400',
      },
      pending: {
        bg: 'bg-amber-100 bg-amber-900/30',
        text: 'text-amber-600 text-amber-400',
      },
      failed: {
        bg: 'bg-red-100 bg-red-900/30',
        text: 'text-red-600 text-red-400',
      },
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100 bg-gray-800',
      text: 'text-gray-600 text-gray-400',
    };

    return (
      <Badge
        variant="outline"
        className={cn('font-normal', config.bg, config.text)}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className=" bg-[#0F0F12] rounded-xl border border-[#1F1F23] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-[#1F1F23]/50">
              <TableHead className="w-[250px]">Transaction</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-400"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const Icon = getCategoryIcon(transaction);

                return (
                  <TableRow
                    key={transaction.id}
                    className=" hover:bg-[#1F1F23]/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg  bg-[#1F1F23]">
                          <Icon className="h-4 w-4  text-gray-300" />
                        </div>
                        <div>
                          <div className="font-medium  text-white">
                            {transaction.title}
                          </div>
                          <div className="text-sm  text-gray-400">
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(transaction.category)}
                    </TableCell>
                    <TableCell className=" text-gray-300">
                      {transaction.timestamp}
                    </TableCell>
                    <TableCell className=" text-gray-300">
                      {transaction.account}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-medium',
                          transaction.type === 'income'
                            ? ' text-emerald-400'
                            : ' text-red-400'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{' '}
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency_code
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/*  <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download receipt</DropdownMenuItem>
                          <DropdownMenuItem>Add note</DropdownMenuItem>
                          <DropdownMenuItem>
                            Dispute transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
