import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon,
  Upload,
  CheckCircle,
  AlertCircle,
  Palette
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  groupCount: number;
  customIcon?: string; // Base64 encoded custom icon
}

interface CategoryManagementProps {
  categories: Category[];
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: (category: Omit<Category, 'id' | 'groupCount'>) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Globe',
    color: 'from-purple-500 to-pink-500',
    description: '',
    customIcon: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Popüler iconlar listesi
  const popularIcons = [
    'Globe', 'Code', 'TrendingUp', 'Camera', 'Briefcase', 'Gamepad2', 
    'Music', 'Book', 'Heart', 'Star', 'Zap', 'Shield', 'Users', 'Settings',
    'Smartphone', 'Monitor', 'Headphones', 'Car', 'Home', 'Plane',
    'Coffee', 'Pizza', 'Dumbbell', 'Palette', 'Microscope', 'Calculator'
  ];

  // Renk seçenekleri
  const colorOptions = [
    { name: 'Purple-Pink', value: 'from-purple-500 to-pink-500' },
    { name: 'Blue-Cyan', value: 'from-blue-500 to-cyan-500' },
    { name: 'Green-Emerald', value: 'from-green-500 to-emerald-500' },
    { name: 'Pink-Rose', value: 'from-pink-500 to-rose-500' },
    { name: 'Orange-Amber', value: 'from-orange-500 to-amber-500' },
    { name: 'Violet-Purple', value: 'from-violet-500 to-purple-500' },
    { name: 'Red-Pink', value: 'from-red-500 to-pink-500' },
    { name: 'Indigo-Blue', value: 'from-indigo-500 to-blue-500' },
    { name: 'Yellow-Orange', value: 'from-yellow-500 to-orange-500' },
    { name: 'Teal-Green', value: 'from-teal-500 to-green-500' }
  ];

  const handleAddCategory = () => {
    setError(null);
    
    if (!newCategory.name.trim()) {
      setError('Kategori adı gereklidir');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      setError('Bu kategori adı zaten mevcut');
      return;
    }

    onAddCategory(newCategory);
    setNewCategory({
      name: '',
      icon: 'Globe',
      color: 'from-purple-500 to-pink-500',
      description: '',
      customIcon: ''
    });
    setShowAddForm(false);
    setSuccess('Kategori başarıyla eklendi');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdateCategory = (category: Category) => {
    onUpdateCategory(category);
    setEditingCategory(null);
    setSuccess('Kategori başarıyla güncellendi');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.groupCount > 0) {
      setError('Bu kategoride gruplar bulunduğu için silinemez');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      onDeleteCategory(categoryId);
      setSuccess('Kategori başarıyla silindi');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Globe;
  };

  const renderIconPreview = (iconName: string, color: string, customIcon?: string) => {
    if (customIcon) {
      return (
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center p-2`}>
          <img
            src={customIcon}
            alt="Custom icon"
            className="w-full h-full object-contain filter brightness-0 invert"
          />
        </div>
      );
    }

    const IconComponent = getIconComponent(iconName);
    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    );
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (1MB)
      if (file.size > 1 * 1024 * 1024) {
        setError('Icon boyutu 1MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir görsel dosyası seçin');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isEdit && editingCategory) {
          setEditingCategory(prev => prev ? { ...prev, customIcon: result, icon: 'custom' } : null);
        } else {
          setNewCategory(prev => ({ ...prev, customIcon: result, icon: 'custom' }));
        }
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomIcon = (isEdit = false) => {
    if (isEdit && editingCategory) {
      setEditingCategory(prev => prev ? { ...prev, customIcon: '', icon: 'Globe' } : null);
    } else {
      setNewCategory(prev => ({ ...prev, customIcon: '', icon: 'Globe' }));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kategori Yönetimi</h1>
        <p className="text-gray-600">Kategorileri ekleyin, düzenleyin ve yönetin</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Add Category Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          return (
            <div key={category.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {renderIconPreview(category.icon, category.color, category.customIcon)}
                  <div>
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <p className="text-gray-500 text-sm">{category.groupCount} grup</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.groupCount > 0}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={category.groupCount > 0 ? 'Bu kategoride gruplar var, silinemez' : 'Sil'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              )}

              {/* Category Color Preview */}
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 bg-gradient-to-br ${category.color} rounded-full`}></div>
                <span className="text-gray-500 text-xs">Kategori rengi</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Yeni Kategori Ekle</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Preview */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h4>
                {renderIconPreview(newCategory.icon, newCategory.color, newCategory.customIcon)}
                <h5 className="font-bold text-gray-900 mt-2">{newCategory.name || 'Kategori Adı'}</h5>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kategori adını girin"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kategori açıklaması (opsiyonel)"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  İkon Seçin
                </label>
                
                {/* Custom Icon Upload */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      {newCategory.customIcon ? (
                        <div className="relative inline-block">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl p-2 border-2 border-purple-500">
                            <img
                              src={newCategory.customIcon}
                              alt="Custom icon"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomIcon(false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleIconUpload(e, false)}
                            className="hidden"
                            id="icon-upload"
                          />
                          <label
                            htmlFor="icon-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium text-sm">Özel İkon Yükle</p>
                              <p className="text-gray-500 text-xs">PNG, JPG, SVG (Max 1MB)</p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">veya</div>
                  </div>
                </div>

                {/* Predefined Icons */}
                <div className="grid grid-cols-6 gap-3">
                  {popularIcons.map((iconName) => {
                    const IconComponent = getIconComponent(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, icon: iconName, customIcon: '' }))}
                        className={`p-3 rounded-2xl border-2 transition-all ${
                          newCategory.icon === iconName && !newCategory.customIcon
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 text-gray-600" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Renk Seçin
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                      className={`relative p-1 rounded-2xl border-2 transition-all ${
                        newCategory.color === color.value
                          ? 'border-gray-400'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-12 bg-gradient-to-br ${color.value} rounded-xl`} />
                      {newCategory.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                >
                  Kategori Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onSave={handleUpdateCategory}
          onClose={() => setEditingCategory(null)}
          getIconComponent={getIconComponent}
          popularIcons={popularIcons}
          colorOptions={colorOptions}
          renderIconPreview={renderIconPreview}
          handleIconUpload={handleIconUpload}
          removeCustomIcon={removeCustomIcon}
        />
      )}
    </div>
  );
};

interface EditCategoryModalProps {
  category: Category;
  onSave: (category: Category) => void;
  onClose: () => void;
  getIconComponent: (iconName: string) => any;
  popularIcons: string[];
  colorOptions: Array<{ name: string; value: string }>;
  renderIconPreview: (iconName: string, color: string, customIcon?: string) => JSX.Element;
  handleIconUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit?: boolean) => void;
  removeCustomIcon: (isEdit?: boolean) => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  onSave,
  onClose,
  getIconComponent,
  popularIcons,
  colorOptions,
  renderIconPreview,
  handleIconUpload,
  removeCustomIcon
}) => {
  const [editedCategory, setEditedCategory] = useState<Category>(category);

  const handleSubmit = () => {
    onSave(editedCategory);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Kategori Düzenle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Preview */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h4>
            {renderIconPreview(editedCategory.icon, editedCategory.color, editedCategory.customIcon)}
            <h5 className="font-bold text-gray-900 mt-2">{editedCategory.name}</h5>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Kategori Adı *
            </label>
            <input
              type="text"
              value={editedCategory.name}
              onChange={(e) => setEditedCategory(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Açıklama
            </label>
            <textarea
              value={editedCategory.description || ''}
              onChange={(e) => setEditedCategory(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              İkon Seçin
            </label>
            
            {/* Custom Icon Upload */}
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  {editedCategory.customIcon ? (
                    <div className="relative inline-block">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl p-2 border-2 border-purple-500">
                        <img
                          src={editedCategory.customIcon}
                          alt="Custom icon"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomIcon(true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIconUpload(e, true)}
                        className="hidden"
                        id="icon-upload-edit"
                      />
                      <label
                        htmlFor="icon-upload-edit"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium text-sm">Özel İkon Yükle</p>
                          <p className="text-gray-500 text-xs">PNG, JPG, SVG (Max 1MB)</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-sm">veya</div>
              </div>
            </div>

            {/* Predefined Icons */}
            <div className="grid grid-cols-6 gap-3">
              {popularIcons.map((iconName) => {
                const IconComponent = getIconComponent(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setEditedCategory(prev => ({ ...prev, icon: iconName, customIcon: '' }))}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      editedCategory.icon === iconName && !editedCategory.customIcon
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Renk Seçin
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEditedCategory(prev => ({ ...prev, color: color.value }))}
                  className={`relative p-1 rounded-2xl border-2 transition-all ${
                    editedCategory.color === color.value
                      ? 'border-gray-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-12 bg-gradient-to-br ${color.value} rounded-xl`} />
                  {editedCategory.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};