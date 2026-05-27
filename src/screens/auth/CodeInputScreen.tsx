import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CodeInputScreen() {
  const navigation = useNavigation<Nav>();
  const [code, setCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCode, setModalCode] = useState('');

  const isActive = code.trim().length > 0;

  const openModal = () => {
    setModalCode(code);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate('StoreConfirm');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="등록하기" showBack />

      <View style={styles.content}>
        <Text style={styles.guide}>{'전달 받은 코드를\n입력해주세요!'}</Text>

        <TextInput
          style={styles.input}
          placeholder="매장 코드"
          placeholderTextColor="#AAAAAA"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />

        <OrangeButton
          title="입력"
          onPress={openModal}
          disabled={!isActive}
          style={[styles.btnOverride, isActive ? styles.btnActive : styles.btnInactive]}
          textStyle={styles.btnText}
        />
      </View>

      {/* 바텀시트 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />

          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>우리 매장 찾기</Text>
            <Text style={styles.sheetLabel}>매장 코드를 입력해주세요</Text>

            <TextInput
              style={styles.sheetInput}
              value={modalCode}
              onChangeText={setModalCode}
              autoCapitalize="none"
              autoFocus
            />

            <View style={styles.sheetButtons}>
              <TouchableOpacity style={styles.prevBtn} onPress={closeModal} activeOpacity={0.7}>
                <Text style={styles.prevBtnText}>이전</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  guide: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24 * 1.5,
  },
  input: {
    width: 256,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF8D28',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1A1A1A',
  },
  btnOverride: {
    width: 274,
    height: 40,
    borderRadius: 5,
  },
  btnActive: {
    backgroundColor: '#FF8D28',
  },
  btnInactive: {
    backgroundColor: '#AAAAAA',
  },
  btnText: {
    fontWeight: '700',
  },

  // 모달
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    width: 328,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
  },
  sheetLabel: {
    fontSize: 14,
    color: '#FF8C00',
  },
  sheetInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  sheetButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  prevBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(21,25,32,0.5)',
  },
  confirmBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
