'use client';
import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/app/_components/session-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, Check, Edit3, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { env } from '@/env';

interface Category {
  value: string;
  label: string;
}

interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    type: string;
  };
}

const updateCategoryNameFunction = async (params: {
  category_id: string;
  name: string;
  type: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-category-name`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({
        category_id: params.category_id,
        name: params.name,
        type: params.type,
      }),
    }
  ).then((res) => res.json())) as UpdateCategoryResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update category');
  }

  return response;
};

export default function CategoriesPage() {
  const { session, signIn } = useSession();
  const [selectedTab, setSelectedTab] = useState<'expense' | 'income'>(
    'expense'
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const categories = useMemo(() => {
    if (selectedTab === 'expense') {
      return session?.user?.expense_categories || [];
    } else {
      return session?.user?.income_categories || [];
    }
  }, [
    session?.user?.expense_categories,
    session?.user?.income_categories,
    selectedTab,
  ]);

  const { isPending, mutateAsync: updateCategoryName } = useMutation({
    mutationFn: updateCategoryNameFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Categoría actualizada con éxito');
      if (response.success && response.data && session) {
        // Update session with new category name
        const updatedCategories =
          selectedTab === 'expense'
            ? session.user.expense_categories.map((cat) =>
                cat.value === response.data.id
                  ? { ...cat, label: response.data.name }
                  : cat
              )
            : session.user.income_categories.map((cat) =>
                cat.value === response.data.id
                  ? { ...cat, label: response.data.name }
                  : cat
              );

        signIn({
          ...session,
          user: {
            ...session.user,
            [selectedTab === 'expense'
              ? 'expense_categories'
              : 'income_categories']: updatedCategories,
          },
        });
      }
      setEditingCategory(null);
      setEditingName('');
    },
  });

  const handleEditStart = (category: Category) => {
    setEditingCategory(category.value);
    setEditingName(category.label);
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const handleEditSave = async () => {
    if (!editingCategory || !editingName.trim() || !session?.token) return;

    await updateCategoryName({
      category_id: editingCategory,
      name: editingName.trim(),
      type: selectedTab,
      token: session.token,
    });
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      {/* Header */}
      <nav className="h-[136px] px-4">
        <div className="flex items-center gap-4 h-full justify-start w-full">
          <Link href="/dashboard/my-account">
            <Button variant="secondary" size="icon" className="h-12 w-12">
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">categorías</h1>
        </div>
      </nav>

      {/* Content */}
      <div className="px-4 pb-20">
        {/* Tab Switch */}
        <div className="flex items-center mb-6">
          <div className="flex bg-gray-800 rounded-xl p-1 w-full">
            <button
              onClick={() => setSelectedTab('expense')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === 'expense'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              gastos
            </button>
            <button
              onClick={() => setSelectedTab('income')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === 'income'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ingresos
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div
              key={category.value}
              className="group relative"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <div
                className={`
                  flex flex-col items-center p-4 rounded-2xl transition-all duration-200 cursor-pointer
                  bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600
                  ${
                    editingCategory === category.value
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }
                `}
                onClick={() =>
                  editingCategory !== category.value &&
                  !isPending &&
                  handleEditStart(category)
                }
              >
                {/* Emoji/Icon placeholder - will be replaced with actual images */}
                <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center mb-3 text-xl">
                  🏷️
                </div>

                {editingCategory === category.value ? (
                  <div className="w-full">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-center text-sm bg-gray-900 border-gray-600 text-white mb-3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      autoFocus
                      disabled={isPending}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSave();
                        }}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCancel();
                        }}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-center font-medium text-gray-200 group-hover:text-white transition-colors">
                      {category.label}
                    </span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="h-4 w-4 text-gray-400" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            {categories.length} categorías • crear categorías próximamente
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
