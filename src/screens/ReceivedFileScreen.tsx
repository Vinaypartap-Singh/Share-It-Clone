import React, { FC, useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, FlatList, Platform, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import Icon from '../components/global/Icon';
import { sendStyles } from '../styles/sendStyles';
import { connectionStyles } from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import { Colors } from '../utils/Constants';
import { formatFileSize } from '../utils/libraryHelpers';
import { goBack } from '../utils/NavigationUtil';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ReceivedFileScreen: FC = () => {
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFilesFromDirectory = async () => {
    setIsLoading(true);
    const platformPath = Platform.OS === 'android'
      ? `${RNFS.DownloadDirectoryPath}/`
      : `${RNFS.DocumentDirectoryPath}/`;

    try {

      const exists = await RNFS.exists(platformPath);
      if (!exists) {
        setReceivedFiles([]);
        setIsLoading(false);
        return;
      }


      const files = await RNFS.readDir(platformPath);

      const formattedFiles = files.map(file => ({
        id: file.name,
        name: file.name,
        size: file.size,
        uri: file.path,
        mimeType: file.name.split('.').pop() || 'unknown',
      }));

      setReceivedFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setReceivedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesFromDirectory();
  }, []);

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case 'mp3':
        return <Icon name="musical-notes" size={16} color="blue" iconFamily="Ionicons" />;
      case 'mp4':
        return <Icon name="videocam" size={16} color="green" iconFamily="Ionicons" />;
      case 'jpg':
        return <Icon name="image" size={16} color="orange" iconFamily="Ionicons" />;
      case 'pdf':
        return <Icon name="document" size={16} color="red" iconFamily="Ionicons" />;
      default:
        return <Icon name="folder" size={16} color="gray" iconFamily="Ionicons" />;
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={connectionStyles.fileItem}>
      <View style={connectionStyles.fileInfoContainer}>
        {renderThumbnail(item.mimeType)}
        <View style={connectionStyles.fileDetails}>
          <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={10}>
            {item.name}
          </CustomText>
          <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={8}>
            {item.mimeType} • {formatFileSize(item.size)}
          </CustomText>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          const normalizedPath = Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;
          if (Platform.OS === 'ios') {
            ReactNativeBlobUtil.ios.openDocument(normalizedPath)
              .then(() => console.log('File opened successfully'))
              .catch(err => console.error("Error opening file:", err));
          } else {
            ReactNativeBlobUtil.android.actionViewIntent(normalizedPath, "*/*")
              .then(() => console.log('File opened successfully'))
              .catch(err => console.error("Error opening file:", err));
          }
        }}
        style={connectionStyles.openButton}>
        <CustomText numberOfLines={1} color="#fff" fontFamily="Okra-Bold" fontSize={9}>
          Open
        </CustomText>
      </TouchableOpacity>
    </View>
  );

  const handleGoBack = () => {
    goBack();
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
      style={sendStyles.container}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}>
      <SafeAreaView />

      <View style={sendStyles.mainContainer}>
        <CustomText fontFamily='Okra-Bold' fontSize={15} color='#fff' style={{ textAlign: 'center', margin: 10 }}>
          All Received Files
        </CustomText>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : receivedFiles.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={receivedFiles}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={connectionStyles.fileList}

            />
          </View>
        ) : (
          <View style={connectionStyles.noDataContainer}>
            <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={11}>
              No files received yet.
            </CustomText>
          </View>
        )}
        <TouchableOpacity onPress={handleGoBack} style={sendStyles.backButton}>
          <Icon name="arrow-back" iconFamily="Ionicons" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ReceivedFileScreen;
