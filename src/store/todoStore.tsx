import { create } from "zustand";
import {
  initDatabase,
  addTodoToDB,
  addPurchaseToDB,
  getTodosFromDB,
  deleteTodoFromDB,
} from "../database/database";
import { format } from "date-fns";

// ✅ 할 일 & 구매 아이템 타입 정의
interface TodoItem {
  id: number;
  text: string;
  type: "todo" | "purchase";
  date: string;
  time?: string | null;
  amount?: number | null;
}

// ✅ Zustand 스토어 타입 정의
interface TodoStore {
  todos: TodoItem[];
  selectedDate: string;
  loadTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  addPurchase: (text: string, amount: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

// ✅ 오늘 날짜를 기본값으로 설정
const todayDate = format(new Date(), "yyyy-MM-dd");

// ✅ Zustand Store (비동기 데이터베이스 적용)
const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  selectedDate: todayDate,

  // ✅ 비동기 DB 로딩 적용
  loadTodos: async () => {
    try {
      await initDatabase();
      await getTodosFromDB((todos) => set({ todos }));
    } catch (error) {
      console.error("❌ LoadTodos Error:", error);
    }
  },

  // ✅ 할 일 추가
  addTodo: async (text: string) => {
    try {
      const isToday = useTodoStore.getState().selectedDate === todayDate;
      const newTodo: TodoItem = {
        id: Date.now(),
        text,
        type: "todo",
        date: useTodoStore.getState().selectedDate,
        time: isToday ? format(new Date(), "HH:mm") : null,
        amount: null,
      };
      await addTodoToDB(text, newTodo.date, newTodo.time);
      set((state) => ({ todos: [...state.todos, newTodo] }));
    } catch (error) {
      console.error("❌ AddTodo Error:", error);
    }
  },

  // ✅ 구매 추가
  addPurchase: async (text: string, amount: number) => {
    try {
      const newPurchase: TodoItem = {
        id: Date.now(),
        text,
        type: "purchase",
        date: useTodoStore.getState().selectedDate,
        time: null,
        amount,
      };
      await addPurchaseToDB(text, amount, newPurchase.date);
      set((state) => ({ todos: [...state.todos, newPurchase] }));
    } catch (error) {
      console.error("❌ AddPurchase Error:", error);
    }
  },

  // ✅ 할 일 삭제
  deleteTodo: async (id: number) => {
    try {
      await deleteTodoFromDB(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    } catch (error) {
      console.error("❌ DeleteTodo Error:", error);
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),
}));

export default useTodoStore;
