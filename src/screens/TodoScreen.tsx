import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { format } from "date-fns";
import useTodoStore from "../store/todoStore";

const TodoScreen = () => {
  const { todos, selectedDate, loadTodos, addTodo, addPurchase, deleteTodo, setSelectedDate } =
    useTodoStore();

  const translateX = new Animated.Value(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("todo"); // "todo" or "purchase"
  const [inputText, setInputText] = useState("");
  const [inputAmount, setInputAmount] = useState("");

  useEffect(() => {
    loadTodos();
  }, []);

  // 📌 날짜 변경 애니메이션 포함
  const changeDate = (direction: "prev" | "next") => {
    Animated.timing(translateX, {
      toValue: direction === "next" ? 100 : -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
      setSelectedDate(format(newDate, "yyyy-MM-dd"));
      translateX.setValue(0);
    });
  };

  // 📌 선택한 날짜의 할 일 필터링
  const filteredTodos = todos.filter((todo) => todo.date === selectedDate);

  // 📌 총 지출 계산
  const totalExpense = filteredTodos
    .filter((todo) => todo.type === "purchase")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  // 📌 모달에서 항목 추가
  const handleAddItem = () => {
    if (modalType === "todo" && inputText.trim()) {
      addTodo(inputText);
    } else if (modalType === "purchase" && inputText.trim() && inputAmount.trim()) {
      addPurchase(inputText, parseInt(inputAmount, 10));
    }
    setInputText("");
    setInputAmount("");
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 📌 날짜 선택 UI */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate("prev")}>
          <Text style={styles.arrow}>◀</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.dateText, { transform: [{ translateX }] }]}>
          {format(new Date(selectedDate), "M/dd (E)")}
        </Animated.Text>
        <TouchableOpacity onPress={() => changeDate("next")}>
          <Text style={styles.arrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* 📌 총 지출 표시 */}
      <Text style={styles.totalExpense}>Total: {totalExpense.toLocaleString()} 원</Text>

      {/* 📌 할 일 & 물건 리스트 */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            {/* 📌 왼쪽 색상 바 추가 */}
            <View
              style={[
                styles.typeIndicator,
                { backgroundColor: item.type === "purchase" ? "#FF4D4D" : "#007BFF" },
              ]}
            />
            
            {/* 📌 할 일 / 구매 정보 */}
            <View style={styles.textContainer}>
              <Text style={styles.todoText} numberOfLines={1} ellipsizeMode="tail">
                {item.text}
              </Text>
              
              {/* 📌 구매일 경우 금액 표시 */}
              {item.type === "purchase" && (
                <Text style={styles.amountText}> ({item.amount}원)</Text>
              )}
            </View>

            {/* 📌 시간 + 삭제 버튼 그룹 */}
            <View style={styles.timeAndDelete}>
              {/* 📌 할 일(Todo)일 경우 시간 표시 */}
              {item.type === "todo" && item.time && (
                <Text style={styles.timeText}>{item.time}</Text>
              )}

              <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />


      {/* 📌 추가 버튼 (눌렀을 때 동그라미 버튼 나옴) */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setModalType("todo");
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>할 일</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, styles.purchaseButton]}
          onPress={() => {
            setModalType("purchase");
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>구매</Text>
        </TouchableOpacity>
      </View>

      {/* 📌 입력 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "todo" ? "할 일 추가" : "구매 추가"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={modalType === "todo" ? "할 일 입력..." : "구매 항목 입력..."}
              value={inputText}
              onChangeText={setInputText}
            />
            {modalType === "purchase" && (
              <TextInput
                style={styles.input}
                placeholder="금액 입력..."
                keyboardType="numeric"
                value={inputAmount}
                onChangeText={setInputAmount}
              />
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleAddItem}>
              <Text style={styles.modalButtonText}>추가</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 📌 스타일 정의 (그림자 제거 & 심플한 UI)
const styles = StyleSheet.create({
  // 📌 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 50,
  },

  // 📌 날짜 선택 바
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  arrow: {
    fontSize: 22,
    color: "#888",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // 📌 총 지출 금액 표시
  totalExpense: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  // 📌 리스트 아이템 (할 일 & 구매)
  todoItem: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  // 📌 왼쪽 구분 바 (할 일: 파란색, 구매: 빨간색)
  typeIndicator: {
    width: 5,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 10, // 내용과 간격 확보
  },

  // 📌 할 일 내용 + 금액을 가로로 정렬
  textContainer: {
    flex: 1, 
    flexDirection: "row",
    alignItems: "center",
  },

  // 📌 할 일 텍스트 스타일
  todoText: {
    fontSize: 16,
    color: "#333",
  },

  // 📌 구매 금액 스타일
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF4D4D", // 빨간색으로 금액 강조
    marginLeft: 5, // 텍스트와 간격 확보
  },

  // 📌 시간 & 삭제 버튼 그룹
  timeAndDelete: {
    flexDirection: "row",
    alignItems: "center",
  },

  // 📌 시간 텍스트 스타일
  timeText: {
    fontSize: 14,
    color: "#666",
    marginRight: 10, // 삭제 버튼과 간격 확보
  },

  // 📌 삭제 버튼
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 20,
    color: "red",
  },

  // 📌 추가 버튼 컨테이너 (할 일 / 구매 추가)
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },

  // 📌 추가 버튼
  addButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    width: 100,
  },

  // 📌 구매 추가 버튼 (색상 변경)
  purchaseButton: {
    backgroundColor: "#FF4D4D",
  },
  
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // 📌 입력 모달 (배경)
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  // 📌 모달 창 스타일
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },

  // 📌 모달 제목
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  // 📌 입력 필드
  input: {
    width: "100%",
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },

  // 📌 모달 버튼 (추가 & 닫기)
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // 📌 모달 닫기 버튼
  modalCloseButton: {
    marginTop: 10,
    alignItems: "center",
  },
});

export default TodoScreen;
