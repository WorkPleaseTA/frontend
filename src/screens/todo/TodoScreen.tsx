import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  PanResponder,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../../components/Header';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface DragState {
  dragIndex: number;
  hoverIndex: number;
}

const INITIAL_TODOS: TodoItem[] = [
  { id: '1', text: '오전 9시 물류 정리', done: true },
  { id: '2', text: '오후 3시 쿠팡 택배 및 냉장고 정리', done: true },
  { id: '3', text: '딸기베이스 채우기', done: true },
  { id: '4', text: '오후 5시 10명 단체 손님', done: false },
  { id: '5', text: '오후 8시 국민학원 단체 주문', done: false },
];

// card height(57) + gap(10)
const ITEM_HEIGHT = 67;

interface DragHandleProps {
  index: number;
  onDragStart: (i: number) => void;
  onDragMove: (i: number, dy: number) => void;
  onDragEnd: (i: number, dy: number) => void;
}

function DragHandle({ index, onDragStart, onDragMove, onDragEnd }: DragHandleProps) {
  // Use refs so PanResponder always calls the latest callbacks without recreating
  const indexRef = useRef(index);
  indexRef.current = index;
  const startRef = useRef(onDragStart);
  startRef.current = onDragStart;
  const moveRef = useRef(onDragMove);
  moveRef.current = onDragMove;
  const endRef = useRef(onDragEnd);
  endRef.current = onDragEnd;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => startRef.current(indexRef.current),
      onPanResponderMove: (_, gs) => moveRef.current(indexRef.current, gs.dy),
      onPanResponderRelease: (_, gs) => endRef.current(indexRef.current, gs.dy),
      onPanResponderTerminate: () => endRef.current(indexRef.current, 0),
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={styles.dragHandle}>
      <View style={styles.handleLine} />
      <View style={styles.handleLine} />
      <View style={styles.handleLine} />
    </View>
  );
}

const SHEET_HEIGHT = 393;

export default function TodoScreen() {
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [editMode, setEditMode] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [addText, setAddText] = useState('');
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const todosLenRef = useRef(todos.length);
  todosLenRef.current = todos.length;

  const openSheet = () => {
    setShowSheet(true);
    Animated.spring(sheetY, {
      toValue: 0,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetY, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowSheet(false);
      setAddText('');
    });
  };

  const handleAddTodo = () => {
    const trimmed = addText.trim();
    if (trimmed) {
      setTodos(prev => [...prev, { id: Date.now().toString(), text: trimmed, done: false }]);
    }
    closeSheet();
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleDragStart = useCallback((index: number) => {
    dragY.setValue(0);
    setDragState({ dragIndex: index, hoverIndex: index });
  }, [dragY]);

  const handleDragMove = useCallback((index: number, dy: number) => {
    dragY.setValue(dy);
    const newHover = Math.max(0, Math.min(todosLenRef.current - 1, Math.round(index + dy / ITEM_HEIGHT)));
    setDragState(prev => {
      if (!prev || prev.hoverIndex === newHover) return prev;
      return { ...prev, hoverIndex: newHover };
    });
  }, [dragY]);

  const handleDragEnd = useCallback((index: number, dy: number) => {
    const finalIndex = Math.max(0, Math.min(todosLenRef.current - 1, Math.round(index + dy / ITEM_HEIGHT)));
    setTodos(prev => {
      if (finalIndex === index) return prev;
      const arr = [...prev];
      const [removed] = arr.splice(index, 1);
      arr.splice(finalIndex, 0, removed);
      return arr;
    });
    setDragState(null);
    dragY.setValue(0);
  }, [dragY]);

  // Calculate visual shift for non-dragged items
  const getShift = (i: number): number => {
    if (!dragState) return 0;
    const { dragIndex, hoverIndex } = dragState;
    if (dragIndex < hoverIndex && i > dragIndex && i <= hoverIndex) return -ITEM_HEIGHT;
    if (dragIndex > hoverIndex && i >= hoverIndex && i < dragIndex) return ITEM_HEIGHT;
    return 0;
  };

  const sectionHeader = (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>오늘의 업무</Text>
      <Text style={styles.sectionArrow}>›</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="오늘의 할 일"
        titleStyle={styles.headerTitle}
        rightElement={
          <TouchableOpacity
            onPress={() => setEditMode(e => !e)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.editIcon, editMode && styles.editIconActive]}>✎</Text>
          </TouchableOpacity>
        }
      />

      {editMode ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!dragState}
        >
          {sectionHeader}
          <View style={styles.dragContainer}>
            {todos.map((item, i) => {
              const shift = getShift(i);
              const isDragging = dragState?.dragIndex === i;

              if (isDragging) {
                return (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.card,
                      styles.cardDragging,
                      { marginBottom: 10, transform: [{ translateY: dragY }] },
                    ]}
                  >
                    <Text style={styles.cardText} numberOfLines={1}>{item.text}</Text>
                    <DragHandle
                      index={i}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  </Animated.View>
                );
              }

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    { marginBottom: 10, transform: [{ translateY: shift }] },
                  ]}
                >
                  <Text style={styles.cardText} numberOfLines={1}>{item.text}</Text>
                  <DragHandle
                    index={i}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={sectionHeader}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText} numberOfLines={1}>{item.text}</Text>
              <TouchableOpacity
                style={[styles.checkbox, item.done && styles.checkboxDone]}
                onPress={() => toggleTodo(item.id)}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {editMode && (
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={openSheet}>
          <Text style={styles.addButtonText}>직접 추가하기</Text>
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
      )}

      <BottomTabBarStatic activeIndex={4} />

      {/* 바텀시트 모달 */}
      <Modal visible={showSheet} transparent animationType="none" onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* 오버레이 - 외부 터치 시 닫힘 */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={closeSheet}
          />

          {/* 시트 */}
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            {/* 핸들바 */}
            <View style={styles.sheetHandleRow}>
              <View style={styles.sheetHandle} />
            </View>

            {/* 입력 카드 */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardIcon}>✎</Text>
              <TextInput
                style={styles.sheetInput}
                value={addText}
                onChangeText={setAddText}
                placeholder="내용을 입력해주세요"
                placeholderTextColor="#BBBBBB"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddTodo}
              />
            </View>

            {/* TO-DO 추가 버튼 */}
            <TouchableOpacity style={styles.sheetAddBtn} activeOpacity={0.8} onPress={handleAddTodo}>
              <Text style={styles.sheetAddBtnText}>TO-DO 추가</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  editIcon: {
    fontSize: 20,
    color: '#FF8D28',
  },
  editIconActive: {
    color: '#FF8C00',
    fontWeight: '700',
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sectionArrow: {
    fontSize: 22,
    color: '#000000',
    lineHeight: 24,
  },

  separator: {
    height: 10,
  },

  dragContainer: {
    overflow: 'visible',
  },

  card: {
    height: 57,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  cardDragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    borderColor: '#FF8D28',
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginRight: 12,
  },

  // Normal mode checkbox
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 4,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: '#FF8D28',
  },
  checkmark: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 13,
  },

  // Edit mode drag handle (3 horizontal lines, 3px thick, #FF8D28)
  dragHandle: {
    width: 28,
    height: 22,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
    flexShrink: 0,
  },
  handleLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF8D28',
  },

  // 바텀시트 모달
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  sheetHandleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 15,
    backgroundColor: '#E9F1FF',
  },
  inputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 32,
    gap: 10,
  },
  inputCardIcon: {
    fontSize: 18,
    color: '#848A94',
  },
  sheetInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
  },
  sheetAddBtn: {
    width: 250,
    height: 40,
    backgroundColor: '#FF8C00',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // "직접 추가하기" button
  addButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    height: 40,
    backgroundColor: '#FF8C00',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButtonIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
});
