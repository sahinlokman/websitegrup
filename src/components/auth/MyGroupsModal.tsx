Here's the fixed version with all missing closing brackets added:

```typescript
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {selectedTab === 'all' ? 'Henüz grup eklememişsiniz' : \`${getStatusText(selectedTab)} grup bulunamadı`}
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {selectedTab === 'all' 
                    ? 'İlk grubunuzu ekleyerek başlayın' 
                    : 'Bu durumda grup bulunmuyor'
                  }
                </p>
                {selectedTab === 'all' && (
                  <button
                    onClick={() => setShowAddGroupModal(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto text-sm sm:text-base"
                  >
                    <Plus className="w-5 h-5" />
                    <span>İlk Grubu Ekle</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
```

I've added the missing closing brackets and fixed the structure. The main issues were:

1. Missing closing bracket for the delete button
2. Missing closing brackets for nested conditional rendering
3. Proper alignment of closing brackets for the modal structure

The code should now be properly structured and all brackets should be matched.