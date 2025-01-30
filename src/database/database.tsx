import SQLite from "react-native-sqlite-storage";

// ✅ Promise API 사용
SQLite.enablePromise(true);

// ✅ 비동기적으로 DB 연결하는 함수
const getDBConnection = async () => {
  try {
    const db = await SQLite.openDatabase(
      {
        name: "todoDB.db",
        location: "default",
      }
    );
    console.log("✅ Database opened successfully!");
    return db;
  } catch (error) {
    console.error("❌ Database opening error:", error);
    throw error;
  }
};

// ✅ 할 일 & 구매 아이템 타입 정의
export interface TodoItem {
  id: number;
  text: string;
  type: "todo" | "purchase";
  date: string;
  time?: string | null;
  amount?: number | null;
}

// ✅ DB 초기화 (테이블 생성)
export const initDatabase = async () => {
  try {
    const db = await getDBConnection();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NULL,
          amount INTEGER NULL
        );`
      );
    });
    console.log("✅ Table initialized!");
  } catch (error) {
    console.error("❌ Table creation error:", error);
  }
};

// ✅ 할 일 추가
export const addTodoToDB = async (text: string, date: string, time: string | null = null) => {
  try {
    const db = await getDBConnection();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `INSERT INTO todos (text, type, date, time, amount) VALUES (?, 'todo', ?, ?, NULL)`,
        [text, date, time]
      );
    });
    console.log("✅ Todo added:", text);
  } catch (error) {
    console.error("❌ addTodoToDB error:", error);
  }
};

// ✅ 구매 추가
export const addPurchaseToDB = async (text: string, amount: number, date: string) => {
  try {
    const db = await getDBConnection();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `INSERT INTO todos (text, type, date, time, amount) VALUES (?, 'purchase', ?, NULL, ?)`,
        [text, date, amount]
      );
    });
    console.log("✅ Purchase added:", text, amount);
  } catch (error) {
    console.error("❌ addPurchaseToDB error:", error);
  }
};

// ✅ 모든 할 일 가져오기
export const getTodosFromDB = async (callback: (todos: TodoItem[]) => void) => {
  try {
    const db = await getDBConnection();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `SELECT * FROM todos ORDER BY date DESC, time ASC;`,
        [],
        (_, result) => {
          const todos: TodoItem[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            todos.push(result.rows.item(i));
          }
          callback(todos);
        }
      );
    });
    console.log("✅ Todos loaded from DB");
  } catch (error) {
    console.error("❌ getTodosFromDB error:", error);
  }
};

// ✅ 할 일 삭제
export const deleteTodoFromDB = async (id: number) => {
  try {
    const db = await getDBConnection();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `DELETE FROM todos WHERE id = ?`,
        [id]
      );
    });
    console.log("✅ Todo deleted:", id);
  } catch (error) {
    console.error("❌ deleteTodoFromDB error:", error);
  }
};

export default getDBConnection;