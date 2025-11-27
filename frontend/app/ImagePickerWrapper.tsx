import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Wrapper customizado para ImagePicker que adiciona validações extras
export const launchImageLibraryWithValidation = async () => {
  try {
    // Para web, criar um input file customizado com accept
    if (Platform.OS === 'web') {
      return new Promise<ImagePicker.ImagePickerResult>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
        input.multiple = false;
        
        input.onchange = async (e: any) => {
          const file = e.target?.files?.[0];
          
          if (!file) {
            resolve({ canceled: true, assets: null });
            return;
          }
          
          // Validar tipo de arquivo
          if (!file.type.startsWith('image/')) {
            alert('Selecione apenas arquivos de imagem');
            resolve({ canceled: true, assets: null });
            return;
          }
          
          // Criar blob URL
          const uri = URL.createObjectURL(file);
          
          resolve({
            canceled: false,
            assets: [{
              uri,
              width: 0,
              height: 0,
              type: 'image',
              fileName: file.name,
              fileSize: file.size,
            }]
          });
        };
        
        input.oncancel = () => {
          resolve({ canceled: true, assets: null });
        };
        
        input.click();
      });
    }
    
    // Mobile usa o ImagePicker nativo normalmente
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
  } catch (error) {
    console.error('Erro no image picker:', error);
    return { canceled: true, assets: null };
  }
};

export const launchCameraWithValidation = async () => {
  try {
    return await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  } catch (error) {
    console.error('Erro na câmera:', error);
    return { canceled: true, assets: null };
  }
};
