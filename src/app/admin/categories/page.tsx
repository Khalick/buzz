"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Tag, Check, X } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    icon: string;
    description?: string;
    business_count?: number;
    created_at: string;
}

const defaultCategories = [
    { name: 'Food & Restaurants', icon: '🍽️' },
    { name: 'Retail & Shopping', icon: '🛍️' },
    { name: 'Services', icon: '🔧' },
    { name: 'Healthcare', icon: '🏥' },
    { name: 'Technology', icon: '💻' },
    { name: 'Education', icon: '📚' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Agriculture', icon: '🌾' },
    { name: 'Manufacturing', icon: '🏭' },
    { name: 'Other', icon: '📦' },
];

const AdminCategoriesPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' });

    useEffect(() => {
        if (!authLoading && user) {
            checkAdminAndFetch();
        }
    }, [user, authLoading]);

    const checkAdminAndFetch = async () => {
        if (!user) return;

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;
            if (userData?.role !== 'admin') {
                router.push('/');
                return;
            }

            setIsAdmin(true);
            fetchCategories();
        } catch (error) {
            console.error('Error checking admin status:', error);
            router.push('/');
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                // If table doesn't exist, show default categories
                console.log('Categories table may not exist, using defaults');
                setCategories([]);
            } else {
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('categories')
                .insert({
                    name: newCategory.name,
                    icon: newCategory.icon,
                    description: newCategory.description,
                    created_at: new Date().toISOString(),
                });

            if (error) throw error;

            alert('Category added successfully!');
            setNewCategory({ name: '', icon: '📦', description: '' });
            setShowAddForm(false);
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category. Make sure the categories table exists in Supabase.');
        }
    };

    const handleUpdateCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({
                    name: editForm.name,
                    icon: editForm.icon,
                    description: editForm.description,
                })
                .eq('id', id);

            if (error) throw error;

            alert('Category updated!');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Error updating category.');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Category deleted!');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category.');
        }
    };

    const startEditing = (category: Category) => {
        setEditingId(category.id);
        setEditForm({
            name: category.name,
            icon: category.icon,
            description: category.description || '',
        });
    };

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
                <div className="w-12 h-12 border-4 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-subtle py-12">
            <div className="max-w-4xl mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
                                <Tag className="w-8 h-8 text-[#1B4332]" />
                                Category Management
                            </h1>
                            <p className="text-[#525252] mt-2">
                                Add, edit, or remove business categories
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="btn btn-primary btn-pill"
                        >
                            <Plus className="w-5 h-5" />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Add New Category</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={newCategory.icon}
                                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                        className="input text-center text-2xl"
                                        placeholder="📦"
                                        maxLength={2}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="input"
                                        placeholder="e.g., Food & Restaurants"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    className="input"
                                    placeholder="Brief description of this category"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories List */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-[#E5E5E5] bg-[#1B4332]/5">
                        <h2 className="font-semibold text-[#1A1A1A]">
                            {categories.length > 0 ? `${categories.length} Categories` : 'Default Categories (Add to DB)'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="divide-y divide-[#E5E5E5]">
                            {categories.map((category) => (
                                <div key={category.id} className="p-4 hover:bg-[#1B4332]/5 transition-colors">
                                    {editingId === category.id ? (
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={editForm.icon}
                                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                                className="w-16 input text-center text-xl"
                                                maxLength={2}
                                            />
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="flex-1 input"
                                            />
                                            <button
                                                onClick={() => handleUpdateCategory(category.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 text-[#525252] hover:bg-gray-100 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{category.icon}</span>
                                                <div>
                                                    <p className="font-medium text-[#1A1A1A]">{category.name}</p>
                                                    {category.description && (
                                                        <p className="text-sm text-[#525252]">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEditing(category)}
                                                    className="p-2 text-[#1B4332] hover:bg-[#1B4332]/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-sm text-[#737373] mb-4">
                                No categories in database yet. Here are the default categories you can add:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {defaultCategories.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-2 p-3 bg-[#1B4332]/5 rounded-xl">
                                        <span className="text-xl">{cat.icon}</span>
                                        <span className="text-sm text-[#525252]">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-[#737373] mt-4">
                                Use the "Add Category" button above to add these to your database.
                            </p>
                        </div>
                    )}
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <a href="/admin" className="text-[#1B4332] hover:text-[#D4AF37] font-medium transition-colors">
                        ← Back to Admin Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminCategoriesPage;
