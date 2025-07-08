import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Users, 
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { TelegramGroup } from '../../types/telegram';

interface EditGroupModalProps {
  group: TelegramGroup;
  onSave: (group: TelegramGroup) => void;
  onClose: () => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onSave, onClose }) => {
  const [editedGroup, setEditedGroup] = useState<TelegramGroup>(group);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(group.image || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Eğer yeni görsel yüklendiyse, onu grup verisine ekle
    const updatedGroup = {
      ...editedGroup,
      image: imagePreview
    };
    onSave(updatedGroup);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Görsel boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir görsel dosyası seçin');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setEditedGroup(prev => ({ ...prev, image: undefined }));
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Grup Düzenle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grup Görseli */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Grup Görseli
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Grup görseli önizleme"
                  className="w-full h-48 object-cover rounded-2xl border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {imageFile ? 'Yeni görsel' : 'Mevcut görsel'}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Görsel yüklemek için tıklayın</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Grup Adı
            </label>
            <input
              type="text"
              value={editedGroup.name}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Açıklama
            </label>
            <textarea
              value={editedGroup.description}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Kategori
              </label>
              <select
                value={editedGroup.category}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Teknoloji">Teknoloji</option>
                <option value="Finans">Finans</option>
                <option value="Sanat">Sanat</option>
                <option value="İş">İş</option>
                <option value="Oyun">Oyun</option>
                <option value="Müzik">Müzik</option>
                <option value="Eğitim">Eğitim</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Üye Sayısı
              </label>
              <input
                type="number"
                value={editedGroup.members}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, members: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Telegram Linki
            </label>
            <input
              type="url"
              value={editedGroup.link}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, link: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedGroup.featured}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 text-sm">Öne Çıkan</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedGroup.verified}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, verified: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 text-sm">Doğrulanmış</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedGroup.approved === true}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, approved: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 text-sm">Onaylanmış</span>
            </label>
          </div>

          {/* Önizleme */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h4 className="text-gray-900 font-semibold mb-3">Grup Önizleme</h4>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                {imagePreview ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt={editedGroup.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {editedGroup.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-bold text-gray-900">{editedGroup.name}</h5>
                    {editedGroup.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{editedGroup.category}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{editedGroup.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">
                  {editedGroup.members.toLocaleString()} üye
                </div>
                <div className="flex items-center space-x-2">
                  {editedGroup.featured && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                      Öne Çıkan
                    </span>
                  )}
                  {editedGroup.verified && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      Doğrulanmış
                    </span>
                  )}
                  {editedGroup.approved && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Onaylanmış
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};